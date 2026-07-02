import { QUEUE_NAMES, type BaseJobData } from "@repo/shared";
import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";

console.log(
  " QUEUE_NAMES.REPOSITORY_INGESTION is ",
  QUEUE_NAMES.REPOSITORY_INGESTION
);

export const repositoryIngestionQueue = new Queue<BaseJobData>(
  QUEUE_NAMES.REPOSITORY_INGESTION,
  { connection: redisConnection }
);
