import { TODO_QUERY_KEYS } from "@/lib/react-query/query-keys";
import { type ListTodosResponse } from "@repo/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteTodoAction } from "../actions/delete-todo-action";

export function useDeleteTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTodoAction,

    onMutate: async (todoId) => {
      await queryClient.cancelQueries({ queryKey: TODO_QUERY_KEYS.all });

      const previousTodos = queryClient.getQueryData<ListTodosResponse>(
        TODO_QUERY_KEYS.all
      );

      queryClient.setQueryData<ListTodosResponse>(
        TODO_QUERY_KEYS.all,
        (oldCache) => {
          if (!oldCache) return oldCache;
          return {
            ...oldCache,
            todos: oldCache.todos.filter((todo) => todo.id !== todoId),
          };
        }
      );

      return { previousTodos };
    },

    onSuccess: async (response, _variables, context): Promise<void> => {
      if (!response.success) {
        toast.error(response.error.message);
        if (context.previousTodos) {
          queryClient.setQueryData(TODO_QUERY_KEYS.all, context.previousTodos);
        }
        return;
      }
    },

    onError: (error, _variables, context) => {
      toast.error(error.message);
      if (context?.previousTodos) {
        queryClient.setQueryData(TODO_QUERY_KEYS.all, context.previousTodos);
      }
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: TODO_QUERY_KEYS.all,
      });
    },
  });
}
