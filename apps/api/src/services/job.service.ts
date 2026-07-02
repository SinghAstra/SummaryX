import { prisma } from "@repo/db";
import {
  AUTH_ERROR_CODES,
  COMMON_ERROR_CODES,
  CreateJobResponse,
  GetJobLogsResponse,
  GetJobResponse,
  JOB_NAMES,
  JOB_STATUS,
} from "@repo/shared";
import { infrastructureQueue } from "../config/queue.js";
import { NotFoundError, UnauthorizedError } from "../errors/api-errors.js";

export const jobService = {
  async createJobRun(userId: string): Promise<CreateJobResponse> {
    const job = await prisma.job.create({
      data: {
        userId,
        status: JOB_STATUS.PENDING,
      },
    });

    await infrastructureQueue.add(JOB_NAMES.ANALYZE_REPO, {
      jobId: job.id,
      userId,
    });

    return { jobId: job.id };
  },

  async getJobById(jobId: string, userId: string): Promise<GetJobResponse> {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundError(
        COMMON_ERROR_CODES.SCHEMA_MISMATCH,
        "Job not found."
      );
    }

    if (job.userId !== userId) {
      throw new UnauthorizedError(
        AUTH_ERROR_CODES.INVALID_CREDENTIALS,
        "Access denied."
      );
    }

    return {
      id: job.id,
      userId: job.userId,
      status: job.status,
      createdAt: job.createdAt.toISOString(),
      startedAt: job.startedAt ? job.startedAt.toISOString() : null,
      completedAt: job.completedAt ? job.completedAt.toISOString() : null,
    };
  },

  async getJobLogsById(
    jobId: string,
    userId: string
  ): Promise<GetJobLogsResponse> {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundError(
        COMMON_ERROR_CODES.RESOURCE_NOT_FOUND,
        "Job not found."
      );
    }

    if (job.userId !== userId) {
      throw new UnauthorizedError(
        AUTH_ERROR_CODES.INVALID_CREDENTIALS,
        "Access denied."
      );
    }

    const logs = await prisma.jobLog.findMany({
      where: { jobId },
      orderBy: { createdAt: "asc" },
    });

    return logs.map((log) => ({
      id: log.id,
      jobId: log.jobId,
      level: log.level,
      message: log.message,
      createdAt: log.createdAt.toISOString(),
    }));
  },
};
