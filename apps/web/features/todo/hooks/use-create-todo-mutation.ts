import { TODO_QUERY_KEYS } from "@/lib/react-query/query-keys";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createTodoAction } from "../actions/create-todo-action";

export function useCreateTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTodoAction,
    onSuccess: async (response) => {
      if (!response.success) {
        toast.error(response.error.message);
        return;
      }

      toast.success(response.data.message);

      await queryClient.invalidateQueries({
        queryKey: TODO_QUERY_KEYS.all,
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
