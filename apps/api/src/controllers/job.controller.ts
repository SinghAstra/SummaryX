// import { prisma } from "@repo/db";
// import {
//   AUTH_ERROR_CODES,
//   BaseJobData,
//   COMMON_ERROR_CODES,
//   GetJobResponse,
//   getJobTelemetryChannel,
//   JOB_NAMES,
//   JOB_STATUS,
//   type ApiResponse,
//   type CreateJobResponse,
// } from "@repo/shared";
// import { type Request, type Response } from "express";
// import z from "zod";
// import { infrastructureQueue } from "../config/queue.js";
// import { redisConnection } from "../config/redis.js";
// import {
//   BadRequestError,
//   NotFoundError,
//   UnauthorizedError,
// } from "../errors/api-errors.js";
// import { jwtTokenEngine } from "../lib/jwt.js";

// export const jobController = {
//   async getJobs(req: Request, res: Response) {
//     if (!req.user) {
//       throw new UnauthorizedError(
//         AUTH_ERROR_CODES.INVALID_CREDENTIALS,
//         "Session credentials missing. Please sign in again."
//       );
//     }

//     const jobs = await prisma.job.findMany({
//       where: { userId: req.user.id },
//       orderBy: { createdAt: "desc" },
//     });

//     const payload: ApiResponse<typeof jobs> = {
//       success: true,
//       data: jobs,
//     };

//     res.status(200).json(payload);
//   },

//   async getJobLogs(req: Request, res: Response) {
//     if (!req.user) {
//       throw new UnauthorizedError(
//         AUTH_ERROR_CODES.INVALID_CREDENTIALS,
//         "Session credentials missing."
//       );
//     }

//     const idParamParse = z.string().uuid().safeParse(req.params.id);
//     if (!idParamParse.success) {
//       throw new BadRequestError(
//         COMMON_ERROR_CODES.VALIDATION_ERROR,
//         "The provided job identifier is structurally malformed."
//       );
//     }

//     const jobId = idParamParse.data;

//     const logs = await prisma.jobLog.findMany({
//       where: { jobId },
//       orderBy: { createdAt: "asc" },
//     });

//     const payload: ApiResponse<typeof logs> = {
//       success: true,
//       data: logs,
//     };

//     res.status(200).json(payload);
//   },

//   async createJob(req: Request, res: Response) {
//     if (!req.user) {
//       throw new UnauthorizedError(
//         AUTH_ERROR_CODES.INVALID_CREDENTIALS,
//         "Session credentials missing. Please sign in again."
//       );
//     }
//     const authenticatedUserId = req.user.id;

//     console.log("authenticatedUserId is ", authenticatedUserId);

//     const databaseJob = await prisma.job.create({
//       data: {
//         userId: authenticatedUserId,
//         status: JOB_STATUS.PENDING,
//       },
//     });

//     const queuePayload: BaseJobData = {
//       jobId: databaseJob.id,
//       userId: authenticatedUserId,
//     };

//     await infrastructureQueue.add(JOB_NAMES.PIPELINE_PARSE, queuePayload);

//     const payload: ApiResponse<CreateJobResponse> = {
//       success: true,
//       data: { jobId: databaseJob.id },
//     };

//     res.status(202).json(payload);
//   },

//   async streamJobTelemetry(req: Request, res: Response) {
//     const idParamParse = z.uuid().safeParse(req.params.id);

//     if (!idParamParse.success) {
//       throw new BadRequestError(
//         COMMON_ERROR_CODES.VALIDATION_ERROR,
//         "The provided streaming job identifier is invalid or structurally malformed."
//       );
//     }

//     const id = idParamParse.data;
//     const queryStringToken = req.query.token as string;

//     if (!queryStringToken) {
//       throw new UnauthorizedError(
//         AUTH_ERROR_CODES.INVALID_CREDENTIALS,
//         "Streaming credentials missing."
//       );
//     }

//     const payloadContext = jwtTokenEngine.verifyAccessToken(queryStringToken);
//     if (!payloadContext) {
//       throw new UnauthorizedError(
//         AUTH_ERROR_CODES.INVALID_CREDENTIALS,
//         "Active connection session has expired."
//       );
//     }

//     res.writeHead(200, {
//       "Content-Type": "text/event-stream",
//       "Cache-Control": "no-cache",
//       Connection: "keep-alive",
//     });

//     const telemetrySubscriber = redisConnection.duplicate();

//     const channelCoordinate = getJobTelemetryChannel(id);
//     await telemetrySubscriber.subscribe(channelCoordinate);

//     telemetrySubscriber.on("message", (_channel, messagePayloadString) => {
//       res.write(`data: ${messagePayloadString}\n\n`);

//       if (
//         messagePayloadString.includes('"COMPLETED"') ||
//         messagePayloadString.includes('"FAILED"')
//       ) {
//         res.end();
//       }
//     });

//     req.on("close", () => {
//       telemetrySubscriber.unsubscribe();
//       telemetrySubscriber.quit();
//     });
//   },

//   async getJob(req: Request, res: Response) {
//     if (!req.user) {
//       throw new UnauthorizedError(
//         AUTH_ERROR_CODES.INVALID_CREDENTIALS,
//         "Your session has expired. Please sign in again to continue."
//       );
//     }

//     const idParamParse = z.string().uuid().safeParse(req.params.id);
//     if (!idParamParse.success) {
//       throw new BadRequestError(
//         COMMON_ERROR_CODES.VALIDATION_ERROR,
//         "The requested terminal record identifier is malformed."
//       );
//     }

//     const jobId = idParamParse.data;

//     const databaseJob = await prisma.job.findUnique({
//       where: { id: jobId },
//     });

//     if (!databaseJob) {
//       throw new NotFoundError(
//         COMMON_ERROR_CODES.SCHEMA_MISMATCH,
//         "We couldn't find the requested analysis pipeline process."
//       );
//     }

//     if (databaseJob.userId !== req.user.id) {
//       throw new UnauthorizedError(
//         AUTH_ERROR_CODES.INVALID_CREDENTIALS,
//         "Access denied. You do not maintain control rights over this task pipeline."
//       );
//     }

//     const payload: ApiResponse<GetJobResponse> = {
//       success: true,
//       data: {
//         id: databaseJob.id,
//         userId: databaseJob.userId,
//         status: databaseJob.status,
//         createdAt: databaseJob.createdAt,
//         startedAt: databaseJob.startedAt,
//         completedAt: databaseJob.completedAt,
//       },
//     };

//     res.status(200).json(payload);
//   },
// };
