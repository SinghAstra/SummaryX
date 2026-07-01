import { apiClient } from "@/lib/api-client/client";
import {
  type ApiResponse,
  CreateTodoFormValues,
  type CreateTodoResponse,
  createTodoResponseSchema,
  DeleteTodoResponse,
  deleteTodoResponseSchema,
  type ListTodosResponse,
  listTodosResponseSchema,
  UpdateTodoResponse,
  updateTodoResponseSchema,
} from "@repo/shared";

export const todoApi = {
  listTodos: (): Promise<ApiResponse<ListTodosResponse>> => {
    return apiClient.get("/api/todos", listTodosResponseSchema);
  },
  createTodo: (
    data: CreateTodoFormValues
  ): Promise<ApiResponse<CreateTodoResponse>> => {
    return apiClient.post("/api/todos", data, createTodoResponseSchema);
  },
  updateTodo: (
    id: string,
    data: { readonly title?: string; readonly completed?: boolean }
  ): Promise<ApiResponse<UpdateTodoResponse>> => {
    return apiClient.put(
      `/api/todos/${encodeURIComponent(id)}`,
      data,
      updateTodoResponseSchema
    );
  },
  deleteTodo: (id: string): Promise<ApiResponse<DeleteTodoResponse>> => {
    return apiClient.delete(
      `/api/todos/${encodeURIComponent(id)}`,
      deleteTodoResponseSchema
    );
  },
};
