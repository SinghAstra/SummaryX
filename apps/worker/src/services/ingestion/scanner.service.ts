import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { TraversalStats } from "./types";
import { IGNORED_DIRECTORIES, SUPPORTED_EXTENSIONS } from "./constants";

export async function traverseDirectory(
  basePath: string,
  currentPath: string,
  stats: TraversalStats,
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
