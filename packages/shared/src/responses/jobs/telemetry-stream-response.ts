import { z } from "zod";
import { repositoryStatusSchema } from "../../schemas/repo.js";

export const telemetryEventSchema = z.object({
  repositoryId: z.string().uuid(),
  status: repositoryStatusSchema,
  progress: z.number().int().min(0).max(100),
  message: z.string(),
  timestamp: z.string(),
});

export type TelemetryEvent = z.infer<typeof telemetryEventSchema>;
