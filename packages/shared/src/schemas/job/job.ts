import { z } from "zod";

export const JOB_STATUS = {
  PENDING: "PENDING",
  RUNNING: "RUNNING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
} as const;

export const LOG_LEVEL = {
  INFO: "INFO",
  ERROR: "ERROR",
} as const;

export const jobStatusSchema = z.enum([
  JOB_STATUS.PENDING,
  JOB_STATUS.RUNNING,
  JOB_STATUS.COMPLETED,
  JOB_STATUS.FAILED,
  JOB_STATUS.CANCELLED,
]);

export const logLevelSchema = z.enum([LOG_LEVEL.INFO, LOG_LEVEL.ERROR]);

export const JobDataSchema = z.object({
  jobId: z.uuid(),
  userId: z.string(),
});

export type JobStatus = z.infer<typeof jobStatusSchema>;
export type LogLevel = z.infer<typeof logLevelSchema>;
export type JobData = z.infer<typeof JobDataSchema>;
