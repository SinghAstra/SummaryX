"use client";

import { CloudOff } from "lucide-react";
import { useTodosQuery } from "../hooks/use-todos-query";
import { AddTodoForm } from "./add-todo-form";
import { TodoList } from "./todo-list";

export function TodoListContainer() {
  const { data, error } = useTodosQuery();

  if (!data && error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const todosList = data.todos;

  return (
    <div className="w-full h-full p-8 space-y-5 animate-in fade-in duration-200">
      {error && (
        <div className="flex items-center gap-2.5 text-xs text-destructive bg-destructive/10 border border-destructive/25 px-3 py-2.5 rounded-lg transition-all duration-150">
          <CloudOff className="w-3.5 h-3.5 shrink-0" />
          <span className="font-medium">
            Couldn&apos;t refresh. Showing previously loaded data.
          </span>
        </div>
      )}

      <AddTodoForm />

      {todosList.length === 0 ? (
        <div className="py-14 border border-dashed border-border rounded-xl text-center bg-muted/30 backdrop-blur-xs">
          <p className="text-sm text-muted-foreground font-medium">
            No tasks left! Add a new one above to get started.
          </p>
        </div>
      ) : (
        <TodoList data={data} />
      )}
    </div>
  );
}
