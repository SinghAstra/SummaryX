import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createJobAction } from "../actions/create-job-action";
import { JOBS_QUERY_KEYS } from "../query-keys";

export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await createJobAction();
      if (!response.success) {
        throw new Error(response.error.message);
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: JOBS_QUERY_KEYS.lists(),
      });
    },
  });
}
