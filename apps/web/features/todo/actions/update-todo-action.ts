"use server";

import { UpdateTodoPayload } from "../../dashboard/types/dashboard.types";
import { todoApi } from "../api/todo-api";

export async function updateTodoAction(payload: UpdateTodoPayload) {
  const { id, data } = payload;
  return todoApi.updateTodo(id, data);
}
