import z from "zod";
import { logLevelSchema } from "./job";

export const logItemSchema = z.object({
  id: z.uuid(),
  jobId: z.uuid(),
  level: logLevelSchema,
  message: z.string(),
  createdAt: z.string(),
});
