import { prisma } from "@repo/db";
import { COMMON_ERROR_CODES, GetJobLogsResponse } from "@repo/shared";
import { NotFoundError } from "../errors/api-errors.js";

export const jobService = {
  async getJobLogsById(jobId: string): Promise<GetJobLogsResponse> {
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
