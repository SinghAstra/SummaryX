import { QUEUE_NAMES, type BaseJobData } from "@repo/shared";
import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";

export const repositoryIngestionQueue = new Queue<BaseJobData>(
  QUEUE_NAMES.REPOSITORY_INGESTION,
  { connection: redisConnection }
);
