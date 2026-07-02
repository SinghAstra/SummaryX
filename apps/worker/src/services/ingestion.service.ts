import { prisma } from "@repo/db";
import { FILE_SUMMARY_STATUS, logError, REPOSITORY_STATUS } from "@repo/shared";
import { exec } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execAsync = promisify(exec);

const IGNORED_DIRECTORIES = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  ".next",
  "out",
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
  async processRepositoryIngestion(repositoryId: string): Promise<void> {
    const repo = await prisma.repository.findUnique({
      where: { id: repositoryId },
    });

    if (!repo) return;

    try {
      // 📂 Step 1: Ensure workspace cleanliness on local scratch space
      await fs.mkdir(path.dirname(repo.diskPath), { recursive: true });
      await fs.rm(repo.diskPath, { recursive: true, force: true });

      // 📥 Step 2: Execute Shallow Git Clone allocation profile
      await execAsync(
        `git clone --depth 1 ${repo.githubUrl} ${repo.diskPath}`,
        {
          timeout: 60000,
        }
      );

      // 📊 Step 3: Run recursive layout indexing operations
      const stats: TraversalStats = {
        totalFiles: 0,
        supportedFiles: 0,
        ignoredFiles: 0,
        totalFolders: 0,
        totalSize: BigInt(0),
        collectedFiles: [],
      };

      await traverseDirectory(repo.diskPath, repo.diskPath, stats);

      // Extract raw readme contents if available on local scratch root
      let readmeContents: string | null = null;
      try {
        readmeContents = await fs.readFile(
          path.join(repo.diskPath, "README.md"),
          "utf8"
        );
      } catch (error) {
        logError(error);
      }

      // 🔒 Step 4: Transaction Lock with extended timeout boundaries
      await prisma.$transaction(
        async (tx) => {
          const updatedRepo = await tx.repository.update({
            where: { id: repositoryId },
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

          console.log("updatedRepo is ", updatedRepo);

          if (stats.collectedFiles.length > 0) {
            const repoFiles = await tx.repositoryFile.createMany({
              data: stats.collectedFiles.map((file) => ({
                repositoryId,
                relativePath: file.relativePath,
                extension: file.extension,
                size: file.size,
                hash: file.hash,
                summaryStatus: FILE_SUMMARY_STATUS.PENDING,
              })),
              skipDuplicates: true,
            });

            console.log("repoFiles is ", repoFiles);
          }
        },
        {
          maxWait: 5000,
          timeout: 30000,
        }
      );
    } catch (error) {
      await prisma.repository.update({
        where: { id: repositoryId },
        data: { status: REPOSITORY_STATUS.FAILED },
      });
      logError(error);
      throw error;
    }
  },
};
