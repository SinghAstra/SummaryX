import { JOB_NAMES } from "@repo/shared";
import { fileSummarizationQueue } from "@repo/shared/server";

export async function queueSummarizationJobs(
  repoId: string,
  jobId: string,
  fileIds: Array<{ id: string }>,
) {
  if (fileIds.length === 0) return;

  await fileSummarizationQueue.addBulk(
    fileIds.map((file, idx) => ({
      name: JOB_NAMES.SUMMARIZE_FILE,
      data: {
        fileId: file.id,
        repositoryId: repoId,
        jobId: jobId,
        runId: idx + 1,
      },
    })),
  );
}
