import { logError, QUEUE_NAMES } from "@repo/shared";
import { Worker, type Job } from "bullmq";
import { redisConnection } from "../config/redis.js";
import { type SummarizeFileJobData } from "../queues/summarization.queue.js";
import { summarizationService } from "../services/summarization.service.js";

export const fileSummarizationWorker = new Worker<SummarizeFileJobData>(
  QUEUE_NAMES.FILE_SUMMARIZATION,
  async (job: Job<SummarizeFileJobData>) => {
    const { fileId, repositoryId, runId } = job.data;
    await summarizationService.processFileSummary(fileId, repositoryId, runId);
  },
  {
    connection: redisConnection,
    concurrency: 4,
  }
);

fileSummarizationWorker.on("failed", (job, error) => {
  logError(error);
});
