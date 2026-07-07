import z from "zod";

export const deleteRepoResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type DeleteRepoResponse = z.infer<typeof deleteRepoResponseSchema>;
