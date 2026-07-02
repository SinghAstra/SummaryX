import { logError, QUEUE_NAMES, type BaseJobData } from "@repo/shared";
import { Worker, type Job } from "bullmq";
import { redisConnection } from "../config/redis.js";
import { ingestionService } from "../services/ingestion.service.js";

export const repositoryIngestionWorker = new Worker<BaseJobData>(
  QUEUE_NAMES.REPOSITORY_INGESTION,
  async (job: Job<BaseJobData>): Promise<void> => {
    const { repositoryId } = job.data;

    await ingestionService.processRepositoryIngestion(repositoryId);
  },
  {
    connection: redisConnection,
    concurrency: 4,
  }
);

repositoryIngestionWorker.on("failed", (job, error) => {
  logError(error);
});
