import { prisma } from "@repo/db";
import { FILE_SUMMARY_STATUS, REPOSITORY_STATUS } from "@repo/shared";
import { TraversalStats } from "./types";

export async function syncDatabaseWithFiles(
  repoId: string,
  stats: TraversalStats
) {
  console.log(`\n🔄 [SyncDB] Starting synchronization for repo: ${repoId}`);

  const existingDBFiles = await prisma.repositoryFile.findMany({
    where: { repositoryId: repoId },
  });

  console.log(
    `📊 [SyncDB] Found ${existingDBFiles.length} existing files in the database.`
  );

  const dbFileMap = new Map(
    existingDBFiles.map((f) => [f.relativePath.replace(/\\/g, "/"), f])
  );

  const scannedFiles = stats.collectedFiles.map((f) => ({
    ...f,
    normalizedPath: f.relativePath.replace(/\\/g, "/"),
  }));

  console.log(
    `📂 [SyncDB] Scanned ${scannedFiles.length} valid files from the filesystem.`
  );

  const fsPaths = new Set(scannedFiles.map((f) => f.normalizedPath));

  const addedFiles = scannedFiles.filter(
    (f) => !dbFileMap.has(f.normalizedPath)
  );

  const modifiedFiles = scannedFiles.filter((f) => {
    const match = dbFileMap.get(f.normalizedPath);

    return match && match.hash !== f.hash;
  });

  const deletedFiles = existingDBFiles.filter(
    (f) => !fsPaths.has(f.relativePath.replace(/\\/g, "/"))
  );

  console.log(`🧮 [SyncDB] Diff Calculation Results:`);

  console.log(`   - ➕ Added:    ${addedFiles.length}`);

  console.log(`   - 📝 Modified: ${modifiedFiles.length}`);

  console.log(`   - ❌ Deleted:  ${deletedFiles.length}`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transactionOperations: any[] = [
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
  ];

  if (deletedFiles.length > 0) {
    transactionOperations.push(
      prisma.repositoryFile.deleteMany({
        where: { id: { in: deletedFiles.map((f) => f.id) } },
      })
    );
  }

  if (addedFiles.length > 0) {
    transactionOperations.push(
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
      })
    );
  }

  modifiedFiles.forEach((file) => {
    transactionOperations.push(
      prisma.repositoryFile.updateMany({
        where: { repositoryId: repoId, relativePath: file.relativePath },
        data: {
          hash: file.hash,
          size: file.size,
          summary: null,
          summaryStatus: FILE_SUMMARY_STATUS.PENDING,
        },
      })
    );
  });

  console.log(
    `⚙️ [SyncDB] Executing Prisma transaction with ${transactionOperations.length} queries...`
  );

  await prisma.$transaction(transactionOperations);

  console.log(`✅ [SyncDB] Transaction completed successfully.`);

  const targetsToQueue = await prisma.repositoryFile.findMany({
    where: {
      repositoryId: repoId,
      summaryStatus: FILE_SUMMARY_STATUS.PENDING,
    },
    select: { id: true },
  });

  console.log(
    `🎯 [SyncDB] Fetched ${targetsToQueue.length} files with PENDING status to queue.`
  );

  if (targetsToQueue.length > 0) {
    console.log(`   - Sample target to queue:`, targetsToQueue[0]);
  }

  return {
    addedCount: addedFiles.length,
    modifiedCount: modifiedFiles.length,
    deletedCount: deletedFiles.length,
    targetsToQueue,
  };
}
