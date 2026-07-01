import { z } from "zod";

export const createTodoResponseSchema = z.object({
  message: z.string(),
  todo: z.object({
    id: z.string(),
    title: z.string(),
    completed: z.boolean(),
    createdAt: z.string(),
  }),
});

export type CreateTodoResponse = z.infer<typeof createTodoResponseSchema>;
