import { logError, QUEUE_NAMES } from "@repo/shared";
import { Worker, type Job } from "bullmq";
import { redisConnection } from "../config/redis.js";
import { type SummarizeFileJobData } from "../queues/summarization.queue.js";
import { summarizationService } from "../services/summarization.service.js";

export const fileSummarizationWorker = new Worker<SummarizeFileJobData>(
  QUEUE_NAMES.FILE_SUMMARIZATION,
  async (job: Job<SummarizeFileJobData>): Promise<void> => {
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
    concurrency: 30,
  }
);

fileSummarizationWorker.on("failed", (job, error) => {
  logError(error);
});
