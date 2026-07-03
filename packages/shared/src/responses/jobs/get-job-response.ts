import { z } from "zod";
import { jobStatusSchema } from "../../schemas";

export const getJobResponseSchema = z.object({
  id: z.uuid(),
  repositoryId: z.string(),
  status: jobStatusSchema,
  createdAt: z.iso.datetime(),
  startedAt: z.iso.datetime().nullable(),
  completedAt: z.iso.datetime().nullable(),
});

export type GetJobResponse = z.infer<typeof getJobResponseSchema>;
