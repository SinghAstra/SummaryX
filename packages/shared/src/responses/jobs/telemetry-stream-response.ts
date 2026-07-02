import { z } from "zod";
import { jobStatusSchema } from "../../schemas/index.js";

export const telemetryEventSchema = z.object({
  repositoryId: z.string().uuid(),
  status: jobStatusSchema,
  progress: z.number().int().min(0).max(100),
  message: z.string(),
  timestamp: z.string(),
});

export type TelemetryEvent = z.infer<typeof telemetryEventSchema>;
