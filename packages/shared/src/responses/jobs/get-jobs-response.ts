import { z } from "zod";
import { jobItemSchema } from "../../schemas/job/job-item";

export type JobItem = z.infer<typeof jobItemSchema>;
export const getJobsResponseSchema = z.array(jobItemSchema);
export type GetJobsResponse = z.infer<typeof getJobsResponseSchema>;
