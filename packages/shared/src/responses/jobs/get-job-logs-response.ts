import { z } from "zod";
import { jobStatusSchema } from "../../schemas";
import { logItemSchema } from "../../schemas/job/log-item";

export const getJobLogsResponseSchema = z.object({
  status: jobStatusSchema,
  logs: z.array(logItemSchema),
});

export type GetJobLogsResponse = z.infer<typeof getJobLogsResponseSchema>;
