import { z } from "zod";

export const createRepoResponseSchema = z.object({
  repositoryId: z.string().uuid(),
  isDuplicate: z.boolean(),
});

export type CreateRepoResponse = z.infer<typeof createRepoResponseSchema>;
