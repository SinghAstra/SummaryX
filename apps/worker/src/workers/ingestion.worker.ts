import { logError, QUEUE_NAMES, RepoIngestionJobData } from "@repo/shared";
import { redisConnection } from "@repo/shared/server";
import { Worker, type Job } from "bullmq";
import { ingestionService } from "../services/ingestion.service.js";

export const repositoryIngestionWorker = new Worker<RepoIngestionJobData>(
  QUEUE_NAMES.REPOSITORY_INGESTION,
  async (job: Job<RepoIngestionJobData>) => {
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
