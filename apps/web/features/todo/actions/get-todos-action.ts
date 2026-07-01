"use server";

import { todoApi } from "../api/todo-api";

export async function getTodosAction() {
  return todoApi.listTodos();
}
