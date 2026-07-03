import { logError, QUEUE_NAMES, type JobData } from "@repo/shared";
import { Worker, type Job } from "bullmq";
import { redisConnection } from "../config/redis.js";
import { ingestionService } from "../services/ingestion.service.js";

export const repositoryIngestionWorker = new Worker<JobData>(
  QUEUE_NAMES.REPOSITORY_INGESTION,
  async (job: Job<JobData>): Promise<void> => {
    const { jobId } = job.data;

    await ingestionService.processRepositoryIngestion(jobId);
  },
  {
    connection: redisConnection,
    concurrency: 4,
  }
);

repositoryIngestionWorker.on("failed", (job, error) => {
  logError(error);
});
