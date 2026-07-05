import { QUEUE_NAMES } from "@repo/shared";
import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";

export interface SummarizeFileJobData {
  fileId: string;
  repositoryId: string;
  runId: number;
}

export const fileSummarizationQueue = new Queue<SummarizeFileJobData>(
  QUEUE_NAMES.FILE_SUMMARIZATION,
  { connection: redisConnection }
);
