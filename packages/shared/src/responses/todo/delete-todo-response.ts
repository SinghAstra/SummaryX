import { z } from "zod";

export const deleteTodoResponseSchema = z.object({
  message: z.string(),
});

export type DeleteTodoResponse = z.infer<typeof deleteTodoResponseSchema>;
