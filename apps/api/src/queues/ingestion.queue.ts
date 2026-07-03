import { QUEUE_NAMES, type JobData } from "@repo/shared";
import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";

export const repositoryIngestionQueue = new Queue<JobData>(
  QUEUE_NAMES.REPOSITORY_INGESTION,
  { connection: redisConnection }
);
