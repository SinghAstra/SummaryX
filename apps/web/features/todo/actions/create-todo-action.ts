"use server";

import { CreateTodoFormValues } from "@repo/shared";
import { todoApi } from "../api/todo-api";

export async function createTodoAction(data: CreateTodoFormValues) {
  return todoApi.createTodo(data);
}
