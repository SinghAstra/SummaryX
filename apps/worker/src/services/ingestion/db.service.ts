import { prisma } from "@repo/db";
import { FILE_SUMMARY_STATUS, REPOSITORY_STATUS } from "@repo/shared";
import { TraversalStats } from "./types";

export async function syncDatabaseWithFiles(
  repoId: string,
  stats: TraversalStats
) {
  const existingDBFiles = await prisma.repositoryFile.findMany({
    where: { repositoryId: repoId },
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

  await prisma.$transaction([
    prisma.repository.update({
      where: { id: repoId },
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
              repositoryId: repoId,
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
          where: { repositoryId: repoId, relativePath: file.relativePath },
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
      repositoryId: repoId,
      summaryStatus: FILE_SUMMARY_STATUS.PENDING,
    },
    select: { id: true },
  });

  return {
    addedCount: addedFiles.length,
    modifiedCount: modifiedFiles.length,
    deletedCount: deletedFiles.length,
    targetsToQueue,
  };
}
