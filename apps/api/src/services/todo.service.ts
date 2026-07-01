import { prisma } from "@repo/db";
import {
  CreateTodoFormValues,
  CreateTodoResponse,
  ListTodosResponse,
  TODO_ERROR_CODES,
} from "@repo/shared";
import { ForbiddenError, NotFoundError } from "../errors/api-errors.js";

export const todoService = {
  async createTodo(
    userId: string,
    data: CreateTodoFormValues
  ): Promise<CreateTodoResponse> {
    const todo = await prisma.todo.create({
      data: {
        title: data.title,
        userId,
      },
    });

    console.log("todo is ", todo);

    return {
      message: "Task added successfully!",
      todo: {
        id: todo.id,
        title: todo.title,
        completed: todo.completed,
        createdAt: todo.createdAt.toISOString(),
      },
    };
  },

  async listTodos(userId: string): Promise<ListTodosResponse> {
    const todos = await prisma.todo.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return {
      todos: todos.map((todo) => ({
        id: todo.id,
        title: todo.title,
        completed: todo.completed,
        createdAt: todo.createdAt.toISOString(),
      })),
    };
  },

  async updateTodo(
    userId: string,
    id: string,
    data: { readonly title?: string; readonly completed?: boolean }
  ): Promise<{ readonly message: string }> {
    const existingTodo = await prisma.todo.findUnique({ where: { id } });

    if (!existingTodo) {
      throw new NotFoundError(
        TODO_ERROR_CODES.TODO_NOT_FOUND,
        "We couldn't find the requested task."
      );
    }

    if (existingTodo.userId !== userId) {
      throw new ForbiddenError(
        TODO_ERROR_CODES.TODO_UNAUTHORIZED,
        "You do not have permission to modify this task."
      );
    }

    await prisma.todo.update({
      where: { id },
      data: {
        title: data.title ?? existingTodo.title,
        completed: data.completed ?? existingTodo.completed,
      },
    });

    return {
      message: "Task updated successfully.",
    };
  },

  async deleteTodo(
    userId: string,
    id: string
  ): Promise<{ readonly message: string }> {
    const existingTodo = await prisma.todo.findUnique({ where: { id } });

    if (!existingTodo) {
      throw new NotFoundError(
        TODO_ERROR_CODES.TODO_NOT_FOUND,
        "We couldn't find the requested task."
      );
    }

    if (existingTodo.userId !== userId) {
      throw new ForbiddenError(
        TODO_ERROR_CODES.TODO_UNAUTHORIZED,
        "You do not have permission to delete this task."
      );
    }

    await prisma.todo.delete({ where: { id } });

    return {
      message: "Task deleted successfully.",
    };
  },
};
