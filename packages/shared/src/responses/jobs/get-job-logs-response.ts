import { z } from "zod";
import { logItemSchema } from "../../schemas/job/log-item";

export const getJobLogsResponseSchema = z.array(logItemSchema);
export type GetJobLogsResponse = z.infer<typeof getJobLogsResponseSchema>;
