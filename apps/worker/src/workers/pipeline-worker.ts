// import { prisma } from "@repo/db";
// import {
//   JOB_STATUS,
//   LOG_LEVEL,
//   logError,
//   QUEUE_NAMES,
//   type BaseJobData,
// } from "@repo/shared";
// import { Worker, type Job } from "bullmq";
// import { redisConnection } from "../config/redis.js";
// import { trackProgress } from "../utils/telemetry.js";

// const delay = (ms: number): Promise<void> =>
//   new Promise((resolve) => setTimeout(resolve, ms));

// export const pipelineWorker = new Worker<BaseJobData>(
//   QUEUE_NAMES.INFRASTRUCTURE_PIPELINE,
//   async (queueJob: Job<BaseJobData>) => {
//     const { jobId, userId } = queueJob.data;

//     try {
//       await prisma.job.update({
//         where: { id: jobId },
//         data: { status: JOB_STATUS.RUNNING, startedAt: new Date() },
//       });

//       await trackProgress({
//         jobId,
//         status: JOB_STATUS.RUNNING,
//         logLevel: LOG_LEVEL.INFO,
//         message: "Worker thread assigned. Commencing processing sequence.",
//       });

//       await delay(30000);

//       await trackProgress({
//         jobId,
//         status: JOB_STATUS.RUNNING,
//         logLevel: LOG_LEVEL.INFO,
//         message: "Analyzing distributed cluster environment frameworks...",
//       });

//       await delay(30000);

//       await trackProgress({
//         jobId,
//         status: JOB_STATUS.RUNNING,
//         logLevel: LOG_LEVEL.INFO,
//         message: `Verifying cross-boundary token signature sets for user: [${userId}]`,
//       });

//       await delay(30000);

//       await trackProgress({
//         jobId,
//         status: JOB_STATUS.RUNNING,
//         logLevel: LOG_LEVEL.INFO,
//         message:
//           "Compiling deep analysis metrics and writing execution vectors...",
//       });

//       await delay(30000);

//       await prisma.job.update({
//         where: { id: jobId },
//         data: { status: JOB_STATUS.COMPLETED, completedAt: new Date() },
//       });

//       await trackProgress({
//         jobId,
//         status: JOB_STATUS.COMPLETED,
//         logLevel: LOG_LEVEL.INFO,
//         message: "All pipeline components resolved successfully.",
//       });
//     } catch (error) {
//       const fallbackMessage =
//         error instanceof Error
//           ? error.message
//           : "An unhandled execution fault occurred.";

//       await prisma.job.update({
//         where: { id: jobId },
//         data: { status: JOB_STATUS.FAILED },
//       });

//       await trackProgress({
//         jobId,
//         status: JOB_STATUS.FAILED,
//         logLevel: LOG_LEVEL.ERROR,
//         message: `CRITICAL_FAULT: ${fallbackMessage}`,
//       });

//       throw error;
//     }
//   },
//   { connection: redisConnection }
// );

// pipelineWorker.on("ready", () =>
//   console.log(`📡 Engine locked onto: [${QUEUE_NAMES.INFRASTRUCTURE_PIPELINE}]`)
// );
// pipelineWorker.on("error", (err) => logError(err));
