import { z } from "zod";

export const listTodosResponseSchema = z.object({
  todos: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      completed: z.boolean(),
      createdAt: z.string(),
    })
  ),
});

export type ListTodosResponse = z.infer<typeof listTodosResponseSchema>;
