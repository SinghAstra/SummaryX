import { QUEUE_NAMES } from "@repo/shared";
import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";

export interface SummarizeFileJobData {
  fileId: string;
  repositoryId: string;
  jobId: string;
  runId: number;
}

export const fileSummarizationQueue = new Queue<SummarizeFileJobData>(
  QUEUE_NAMES.FILE_SUMMARIZATION,
  { connection: redisConnection }
);

// async function cleanStaleSummarizationQueue() {
//   try {
//     await fileSummarizationQueue.obliterate({ force: true });
//     console.log(
//       "🧹 [Queue System] Successfully obliterated stale summarization tokens from Redis."
//     );
//   } catch (error: unknown) {
//     console.error(
//       "🚨 [Queue System] Failed to wipe stale cache frameworks:",
//       error
//     );
//   }
// }

// void cleanStaleSummarizationQueue();
