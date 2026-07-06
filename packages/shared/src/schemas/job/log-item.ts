import z from "zod";

export const logItemSchema = z.object({
  id: z.uuid(),
  jobId: z.uuid(),
  message: z.string(),
  createdAt: z.string(),
});

export type LogItem = z.infer<typeof logItemSchema>;
