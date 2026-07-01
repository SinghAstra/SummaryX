import { z } from "zod";
import { logLevelSchema } from "./contracts.js";

export const logItemSchema = z.object({
  id: z.uuid(),
  jobId: z.uuid(),
  level: logLevelSchema,
  message: z.string(),
  createdAt: z.string(),
});

export const getJobLogsResponseSchema = z.array(logItemSchema);
export type GetJobLogsResponse = z.infer<typeof getJobLogsResponseSchema>;
