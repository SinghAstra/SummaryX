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

export const jobStatusSchema = z.enum(JOB_STATUS);
export const logLevelSchema = z.enum(LOG_LEVEL);

export const baseJobDataSchema = z.object({
  jobId: z.uuid(),
  userId: z.string(),
});

export const createJobResponseSchema = z.object({
  jobId: z.uuid(),
});

export const jobProgressEventSchema = z.object({
  status: jobStatusSchema,
  message: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  error: z
    .object({
      code: z.string(),
      message: z.string(),
    })
    .optional(),
});

export type JobStatus = (typeof JOB_STATUS)[keyof typeof JOB_STATUS];
export type LogLevel = (typeof LOG_LEVEL)[keyof typeof LOG_LEVEL];
export type BaseJobData = z.infer<typeof baseJobDataSchema>;
export type CreateJobResponse = z.infer<typeof createJobResponseSchema>;
export type JobProgressEvent = z.infer<typeof jobProgressEventSchema>;
