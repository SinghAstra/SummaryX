"use client";

import { Plus } from "lucide-react";
import { SubmitEvent, useState } from "react";
import { toast } from "sonner";
import { useCreateTodoMutation } from "../hooks/use-create-todo-mutation";

export function AddTodoForm() {
  const [title, setTitle] = useState("");
  const createMutation = useCreateTodoMutation();

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) return;
    const promise = createMutation.mutateAsync({ title: title.trim() });

    toast.promise(promise, {
      loading: "Creating your task, please wait...",
      success: (response) => {
        if (!response.success) {
          throw new Error(response.error.message);
        }

        setTitle("");
        return response.data.message;
      },
      error: (err) => err.message,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full ">
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new todo..."
          disabled={createMutation.isPending}
          className="flex-1 px-4 py-2 cursor-pointer rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={createMutation.isPending || !title.trim()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>
    </form>
  );
}
