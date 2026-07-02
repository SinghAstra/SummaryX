import { z } from "zod";

export const createJobResponseSchema = z.object({
  jobId: z.uuid(),
});

export type CreateJobResponse = z.infer<typeof createJobResponseSchema>;
