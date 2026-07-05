import { prisma } from "@repo/db";
import {
  FILE_SUMMARY_STATUS,
  JOB_STATUS,
  LOG_LEVEL,
  logError,
  REPOSITORY_STATUS,
} from "@repo/shared";
import { exec } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { fileSummarizationQueue } from "../queues/summarization.queue.js";
import { trackProgress } from "../utils/telemetry.js";

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
): Promise<void> {
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
  async processRepositoryIngestion(jobId: string): Promise<void> {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });
    if (!job) return;

    const repo = await prisma.repository.findUnique({
      where: { id: job.repositoryId },
    });
    if (!repo) return;

    try {
      await prisma.job.update({
        where: { id: jobId },
        data: { status: JOB_STATUS.RUNNING, startedAt: new Date() },
      });

      await trackProgress({
        jobId,
        repositoryId: repo.id,
        status: JOB_STATUS.RUNNING,
        logLevel: LOG_LEVEL.INFO,
        message: "Getting things ready...",
      });

      await fs.mkdir(path.dirname(repo.diskPath), { recursive: true });
      await fs.rm(repo.diskPath, { recursive: true, force: true });

      await trackProgress({
        jobId,
        repositoryId: repo.id,
        status: JOB_STATUS.RUNNING,
        logLevel: LOG_LEVEL.INFO,
        message: "Downloading your project files...",
      });

      await execAsync(
        `git clone --depth 1 ${repo.githubUrl} ${repo.diskPath}`,
        { timeout: 60000 }
      );

      await trackProgress({
        jobId,
        repositoryId: repo.id,
        status: JOB_STATUS.RUNNING,
        logLevel: LOG_LEVEL.INFO,
        message: "Looking through your folders...",
      });

      const stats: TraversalStats = {
        totalFiles: 0,
        supportedFiles: 0,
        ignoredFiles: 0,
        totalFolders: 0,
        totalSize: BigInt(0),
        collectedFiles: [],
      };
      await traverseDirectory(repo.diskPath, repo.diskPath, stats);

      let readmeContents: string | null = null;
      try {
        readmeContents = await fs.readFile(
          path.join(repo.diskPath, "README.md"),
          "utf8"
        );
      } catch (error) {
        logError(error);
      }

      await trackProgress({
        jobId,
        repositoryId: repo.id,
        status: JOB_STATUS.RUNNING,
        logLevel: LOG_LEVEL.INFO,
        message: "Setting up your dashboard views...",
      });

      await prisma.$transaction(
        async (tx) => {
          await tx.repository.update({
            where: { id: job.repositoryId },
            data: {
              status: REPOSITORY_STATUS.PROCESSING,
              readme: readmeContents,
              totalFiles: stats.totalFiles,
              supportedFiles: stats.supportedFiles,
              ignoredFiles: stats.ignoredFiles,
              totalFolders: stats.totalFolders,
              totalSize: stats.totalSize,
            },
          });

          if (stats.collectedFiles.length > 0) {
            await tx.repositoryFile.createMany({
              data: stats.collectedFiles.map((file) => ({
                repositoryId: job.repositoryId,
                relativePath: file.relativePath,
                extension: file.extension,
                size: file.size,
                hash: file.hash,
                summaryStatus: FILE_SUMMARY_STATUS.PENDING,
              })),
              skipDuplicates: true,
            });
          }
        },
        { maxWait: 5000, timeout: 30000 }
      );

      const createdFileRecords = await prisma.repositoryFile.findMany({
        where: {
          repositoryId: job.repositoryId,
          summaryStatus: FILE_SUMMARY_STATUS.PENDING,
        },
        select: { id: true },
      });

      if (createdFileRecords.length > 0) {
        await fileSummarizationQueue.addBulk(
          createdFileRecords.map((file, idx) => ({
            name: "summarize-file-task",
            data: {
              fileId: file.id,
              repositoryId: job.repositoryId,
              jobId: jobId,
              runId: idx + 1,
            },
            opts: {
              attempts: 3,
              backoff: { type: "exponential", delay: 2000 },
            },
          }))
        );
      }

      await prisma.job.update({
        where: { id: jobId },
        data: { status: JOB_STATUS.COMPLETED, completedAt: new Date() },
      });

      await trackProgress({
        jobId,
        repositoryId: repo.id,
        status: JOB_STATUS.RUNNING,
        logLevel: LOG_LEVEL.INFO,
        message: `Project loaded! Starting analysis on ${createdFileRecords.length} files...`,
      });
    } catch (error) {
      await prisma.job.update({
        where: { id: jobId },
        data: { status: JOB_STATUS.FAILED },
      });

      await prisma.repository.update({
        where: { id: job.repositoryId },
        data: { status: REPOSITORY_STATUS.FAILED },
      });

      await trackProgress({
        jobId,
        repositoryId: repo.id,
        status: JOB_STATUS.FAILED,
        logLevel: LOG_LEVEL.ERROR,
        message: "We couldn't load your project. Please try again.",
      });

      logError(error);
      throw error;
    }
  },
};
