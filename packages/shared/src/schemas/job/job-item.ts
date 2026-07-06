import z from "zod";
import { jobStatusSchema } from "./job.schema";

export const jobItemSchema = z.object({
  id: z.uuid(),
  userId: z.string(),
  status: jobStatusSchema,
  createdAt: z.string(),
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
});
