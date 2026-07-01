import { z } from "zod";

export const getJobResponseSchema = z.object({
  id: z.uuid(),
  userId: z.string(),
  status: z.string(),
  createdAt: z.date().or(z.string()),
  startedAt: z.date().or(z.string()).nullable().optional(),
  completedAt: z.date().or(z.string()).nullable().optional(),
});

export type GetJobResponse = z.infer<typeof getJobResponseSchema>;
