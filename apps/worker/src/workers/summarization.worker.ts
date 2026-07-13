import { FileSummarizationJobData, logError, QUEUE_NAMES } from "@repo/shared";
import { redisConnection } from "@repo/shared/server";
import { Worker, type Job } from "bullmq";
import { summarizationService } from "../services/summarization.service.js";

export const fileSummarizationWorker = new Worker<FileSummarizationJobData>(
  QUEUE_NAMES.FILE_SUMMARIZATION,
  async (job: Job<FileSummarizationJobData>) => {
    const { fileId, repositoryId, jobId, runId } = job.data;
    await summarizationService.processFileSummary(
      fileId,
      repositoryId,
      jobId,
      runId
    );
  },
  {
    connection: redisConnection,
    concurrency: 6,
  }
);

fileSummarizationWorker.on("failed", (job, error) => {
  logError(error);
});
