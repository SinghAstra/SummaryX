"use client";

import { ListTodosResponse } from "@repo/shared";
import { Check, Trash2 } from "lucide-react";
import { useDeleteTodoMutation } from "../hooks/use-delete-todo-mutation";
import { useUpdateTodoMutation } from "../hooks/use-update-todo-mutation";

type Todo = ListTodosResponse["todos"][number];

interface TodoItemProps {
  todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
  const updateMutation = useUpdateTodoMutation();
  const deleteMutation = useDeleteTodoMutation();

  const createdDate = new Date(todo.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleToggle = () => {
    updateMutation.mutate({
      id: todo.id,
      data: {
        completed: !todo.completed,
      },
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this todo?")) {
      deleteMutation.mutate(todo.id);
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 bg-card rounded-lg border hover:border-primary/50 transition-colors">
      <button
        onClick={handleToggle}
        className={`shrink-0 cursor-pointer w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
          todo.completed
            ? "bg-primary border-primary"
            : "border-muted-foreground hover:border-primary"
        }`}
      >
        {todo.completed && (
          <Check className="w-4 h-4 text-primary-foreground" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium leading-tight wrap-break-word ${
            todo.completed
              ? "text-muted-foreground line-through"
              : "text-foreground"
          }`}
        >
          {todo.title}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{createdDate}</p>
      </div>
      <button
        onClick={handleDelete}
        className="shrink-0 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors cursor-pointer"
        title="Delete todo"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
