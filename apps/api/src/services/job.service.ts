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
import { NotFoundError, UnauthorizedError } from "../errors/api-errors.js";
import { repositoryIngestionQueue } from "../queues/ingestion.queue.js";

export const jobService = {
  async createJobRun(
    userId: string,
    repositoryId: string
  ): Promise<CreateJobResponse> {
    const job = await prisma.job.create({
      data: {
        repositoryId,
        status: JOB_STATUS.PENDING,
      },
    });

    await repositoryIngestionQueue.add(JOB_NAMES.ANALYZE_REPO, {
      jobId: job.id,
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

    return {
      id: job.id,
      repositoryId: job.repositoryId,
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
