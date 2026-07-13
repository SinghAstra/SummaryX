import { prisma } from "@repo/db";
import {
  FILE_SUMMARY_STATUS,
  JOB_NAMES,
  JOB_STATUS,
  logError,
  REPOSITORY_STATUS,
} from "@repo/shared";
import { fileSummarizationQueue, trackProgress } from "@repo/shared/server";
import { exec } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { getWorkspacePath } from "../utils/workspace.js";

const execAsync = promisify(exec);

const IGNORED_DIRECTORIES = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  ".next",
  "out",
  "generated",
  ".prisma",
]);

const SUPPORTED_EXTENSIONS = new Set([
  ".ts",
  ".js",
  ".tsx",
  ".jsx",
  ".md",
  ".json",
  ".py",
  ".go",
  ".rs",
  ".cpp",
  ".c",
  ".h",
  ".cs",
  ".java",
  ".yml",
  ".yaml",
]);

interface TraversalStats {
  totalFiles: number;
  supportedFiles: number;
  ignoredFiles: number;
  totalFolders: number;
  totalSize: bigint;
  collectedFiles: Array<{
    relativePath: string;
    extension: string;
    size: number;
    hash: string;
  }>;
}

async function traverseDirectory(
  basePath: string,
  currentPath: string,
  stats: TraversalStats
) {
  const entries = await fs.readdir(currentPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(currentPath, entry.name);
    const relativePath = path.relative(basePath, fullPath);

    if (entry.isDirectory()) {
      if (IGNORED_DIRECTORIES.has(entry.name)) {
        stats.ignoredFiles += 1;
        continue;
      }
      stats.totalFolders += 1;
      await traverseDirectory(basePath, fullPath, stats);
    } else if (entry.isFile()) {
      stats.totalFiles += 1;

      const fileStat = await fs.stat(fullPath);
      const ext = path.extname(entry.name).toLowerCase();
      const fileSize = fileStat.size;

      if (!SUPPORTED_EXTENSIONS.has(ext)) {
        stats.ignoredFiles += 1;
        continue;
      }

      stats.supportedFiles += 1;
      stats.totalSize += BigInt(fileSize);

      const content = await fs.readFile(fullPath);
      const hash = crypto.createHash("sha256").update(content).digest("hex");

      stats.collectedFiles.push({
        relativePath,
        extension: ext,
        size: fileSize,
        hash,
      });
    }
  }
}

export const ingestionService = {
  async processRepositoryIngestion(jobId: string, isResync = false) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return;

    const repo = await prisma.repository.findUnique({
      where: { id: job.repositoryId },
    });
    if (!repo) return;
    const workspacePath = getWorkspacePath(repo.id);

    try {
      await prisma.job.update({
        where: { id: jobId },
        data: { status: JOB_STATUS.RUNNING, startedAt: new Date() },
      });

      await trackProgress({
        jobId,
        repositoryId: repo.id,
        status: JOB_STATUS.RUNNING,
        message: "Synchronizing workspace...",
      });

      if (isResync) {
        await execAsync(`git fetch --depth 1 && git reset --hard FETCH_HEAD`, {
          cwd: workspacePath,
          timeout: 60000,
        });
      } else {
        await fs.mkdir(path.dirname(workspacePath), { recursive: true });
        await fs.rm(workspacePath, { recursive: true, force: true });
        await execAsync(
          `git clone --depth 1 ${repo.githubUrl} ${workspacePath}`,
          { timeout: 60000 }
        );
      }

      await trackProgress({
        jobId,
        repositoryId: repo.id,
        status: JOB_STATUS.RUNNING,
        message: "Scanning files...",
      });

      const stats: TraversalStats = {
        totalFiles: 0,
        supportedFiles: 0,
        ignoredFiles: 0,
        totalFolders: 0,
        totalSize: BigInt(0),
        collectedFiles: [],
      };
      await traverseDirectory(workspacePath, workspacePath, stats);

      const existingDBFiles = await prisma.repositoryFile.findMany({
        where: { repositoryId: repo.id },
      });

      const dbFileMap = new Map(
        existingDBFiles.map((f) => [f.relativePath.replace(/\\/g, "/"), f])
      );
      const fsPaths = new Set(
        stats.collectedFiles.map((f) => f.relativePath.replace(/\\/g, "/"))
      );

      const addedFiles = stats.collectedFiles.filter(
        (f) => !dbFileMap.has(f.relativePath.replace(/\\/g, "/"))
      );

      const modifiedFiles = stats.collectedFiles.filter((f) => {
        const match = dbFileMap.get(f.relativePath.replace(/\\/g, "/"));
        return match && match.hash !== f.hash;
      });

      const deletedFiles = existingDBFiles.filter(
        (f) => !fsPaths.has(f.relativePath.replace(/\\/g, "/"))
      );

      await trackProgress({
        jobId,
        repositoryId: repo.id,
        status: JOB_STATUS.RUNNING,
        message: `Updating index (${addedFiles.length} added, ${modifiedFiles.length} modified, ${deletedFiles.length} deleted)...`,
      });

      await prisma.$transaction([
        prisma.repository.update({
          where: { id: repo.id },
          data: {
            status: REPOSITORY_STATUS.PROCESSING,
            totalFiles: stats.totalFiles,
            supportedFiles: stats.supportedFiles,
            ignoredFiles: stats.ignoredFiles,
            totalFolders: stats.totalFolders,
            totalSize: stats.totalSize,
          },
        }),
        ...(deletedFiles.length > 0
          ? [
              prisma.repositoryFile.deleteMany({
                where: { id: { in: deletedFiles.map((f) => f.id) } },
              }),
            ]
          : []),
        ...(addedFiles.length > 0
          ? [
              prisma.repositoryFile.createMany({
                data: addedFiles.map((file) => ({
                  repositoryId: repo.id,
                  relativePath: file.relativePath,
                  extension: file.extension,
                  size: file.size,
                  hash: file.hash,
                  summaryStatus: FILE_SUMMARY_STATUS.PENDING,
                })),
                skipDuplicates: true,
              }),
            ]
          : []),
      ]);

      const CHUNK_SIZE = 100;
      for (let i = 0; i < modifiedFiles.length; i += CHUNK_SIZE) {
        const chunk = modifiedFiles.slice(i, i + CHUNK_SIZE);
        await Promise.all(
          chunk.map((file) =>
            prisma.repositoryFile.updateMany({
              where: { repositoryId: repo.id, relativePath: file.relativePath },
              data: {
                hash: file.hash,
                size: file.size,
                summary: null,
                summaryStatus: FILE_SUMMARY_STATUS.PENDING,
              },
            })
          )
        );
      }

      const targetsToQueue = await prisma.repositoryFile.findMany({
        where: {
          repositoryId: repo.id,
          summaryStatus: FILE_SUMMARY_STATUS.PENDING,
        },
        select: { id: true },
      });

      if (targetsToQueue.length > 0) {
        await fileSummarizationQueue.addBulk(
          targetsToQueue.map((file, idx) => ({
            name: JOB_NAMES.SUMMARIZE_FILE,
            data: {
              fileId: file.id,
              repositoryId: repo.id,
              jobId: jobId,
              runId: idx + 1,
            },
            opts: {
              attempts: 5,
              backoff: { type: "exponential", delay: 2000 },
            },
          }))
        );

        await trackProgress({
          jobId,
          repositoryId: repo.id,
          status: JOB_STATUS.RUNNING,
          message: `Initializing AI analysis for ${targetsToQueue.length} files...`,
        });
      } else {
        await prisma.repository.update({
          where: { id: repo.id },
          data: { status: REPOSITORY_STATUS.COMPLETED },
        });

        await trackProgress({
          jobId,
          repositoryId: repo.id,
          status: JOB_STATUS.COMPLETED,
          message: "Workspace is up to date.",
        });
      }

      await prisma.job.update({
        where: { id: jobId },
        data: { status: JOB_STATUS.COMPLETED, completedAt: new Date() },
      });
    } catch (error) {
      await prisma.job.update({
        where: { id: jobId },
        data: { status: JOB_STATUS.FAILED },
      });

      await prisma.repository.update({
        where: { id: repo.id },
        data: { status: REPOSITORY_STATUS.FAILED },
      });

      await trackProgress({
        jobId,
        repositoryId: repo.id,
        status: JOB_STATUS.FAILED,
        message: "Process failed. Please try again.",
      });

      logError(error);
      throw error;
    }
  },
};
