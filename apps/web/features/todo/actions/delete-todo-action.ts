"use server";

import { todoApi } from "../api/todo-api";

export async function deleteTodoAction(id: string) {
  return todoApi.deleteTodo(id);
}
