import { prisma } from "@repo/db";
import {
  FILE_SUMMARY_STATUS,
  JOB_STATUS,
  REPOSITORY_STATUS,
} from "@repo/shared";
import { trackProgress } from "@repo/shared/server";

export async function updateGlobalProgress(
  repositoryId: string,
  jobId: string
) {
  const totalCount = await prisma.repositoryFile.count({
    where: { repositoryId },
  });

  const completedCount = await prisma.repositoryFile.count({
    where: { repositoryId, summaryStatus: FILE_SUMMARY_STATUS.COMPLETED },
  });

  await trackProgress({
    jobId,
    repositoryId,
    status: JOB_STATUS.RUNNING,
    message: `Analyzing files... (${completedCount}/${totalCount})`,
  });

  if (completedCount === totalCount) {
    await prisma.repository.update({
      where: { id: repositoryId },
      data: { status: REPOSITORY_STATUS.COMPLETED },
    });

    await trackProgress({
      jobId,
      repositoryId,
      status: JOB_STATUS.COMPLETED,
      message: "All done! Your project overview is completely ready.",
    });
  }
}
