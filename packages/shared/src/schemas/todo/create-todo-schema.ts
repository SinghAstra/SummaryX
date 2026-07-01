import { z } from "zod";

export const createTodoSchema = z.object({
  title: z
    .string({ error: "Please enter a title for your todo." })
    .min(1, { message: "Todo title cannot be empty." })
    .max(200, { message: "Title must be under 200 characters." }),
});

export type CreateTodoFormValues = z.infer<typeof createTodoSchema>;
