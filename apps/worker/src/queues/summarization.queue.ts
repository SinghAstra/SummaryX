import { QUEUE_NAMES } from "@repo/shared";
import { Queue, QueueOptions } from "bullmq";
import { redisConnection } from "../config/redis.js";

export interface SummarizeFileJobData {
  fileId: string;
  repositoryId: string;
  jobId: string;
  runId: number;
}

const queueOptions: QueueOptions = {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
};

export const fileSummarizationQueue = new Queue<SummarizeFileJobData>(
  QUEUE_NAMES.FILE_SUMMARIZATION,
  queueOptions
);

async function cleanStaleSummarizationQueue() {
  try {
    await fileSummarizationQueue.obliterate({ force: true });
    console.log(
      "🧹 [Queue System] Successfully obliterated stale summarization tokens from Redis."
    );
  } catch (error: unknown) {
    console.error(
      "🚨 [Queue System] Failed to wipe stale cache frameworks:",
      error
    );
  }
}

// void cleanStaleSummarizationQueue();
