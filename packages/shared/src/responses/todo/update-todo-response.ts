import { z } from "zod";

export const updateTodoResponseSchema = z.object({
  message: z.string(),
});

export type UpdateTodoResponse = z.infer<typeof updateTodoResponseSchema>;
