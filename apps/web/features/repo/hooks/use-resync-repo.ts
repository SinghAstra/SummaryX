import { logError, REPOSITORY_STATUS, ResyncRepoResponse } from "@repo/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resyncRepositoryAction } from "../actions/resync-repo-action.js";
import { repoKeys } from "../query-keys.js";

export function useResyncRepository(repositoryId: string) {
  const queryClient = useQueryClient();

  return useMutation<ResyncRepoResponse, Error>({
    mutationFn: async () => {
      const response = await resyncRepositoryAction(repositoryId);

      if (!response.success) {
        throw new Error(response.error.message);
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.setQueryData(repoKeys.detail(repositoryId), (oldRepo) => {
        if (!oldRepo) return oldRepo;
        return {
          ...oldRepo,
          status: REPOSITORY_STATUS.PROCESSING,
        };
      });

      queryClient.invalidateQueries({
        queryKey: repoKeys.lists(),
      });
    },
    onError: (error) => {
      logError(error);
    },
  });
}
