import { prisma } from "@repo/db";
import { CreateJobResponse, JOB_NAMES, JOB_STATUS } from "@repo/shared";
import { infrastructureQueue } from "../config/queue.js";

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
};
