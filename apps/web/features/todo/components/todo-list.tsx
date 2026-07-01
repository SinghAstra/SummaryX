import { ListTodosResponse } from "@repo/shared";
import { TodoItem } from "./todo-item";

interface TodoListProps {
  data: ListTodosResponse;
}

export function TodoList({ data }: TodoListProps) {
  const completedCount = data.todos.filter((todo) => todo.completed).length;
  const totalCount = data.todos.length;

  if (totalCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground text-sm">
          No todos yet. Create one to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="font-bold text-foreground">My Todos</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {completedCount} of {totalCount} completed
        </p>
      </div>

      <div className="space-y-2">
        {data.todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </div>
    </div>
  );
}
