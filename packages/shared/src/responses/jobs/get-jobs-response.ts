import { z } from "zod";
import { jobStatusSchema } from "./contracts.js";

export const jobItemSchema = z.object({
  id: z.uuid(),
  userId: z.string(),
  status: jobStatusSchema,
  createdAt: z.string(),
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
});

export type JobItem = z.infer<typeof jobItemSchema>;
export const getJobsResponseSchema = z.array(jobItemSchema);
export type GetJobsResponse = z.infer<typeof getJobsResponseSchema>;
