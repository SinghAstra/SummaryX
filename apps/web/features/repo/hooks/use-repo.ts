import { type RepositoryData } from "@repo/shared";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getRepositoryAction } from "../actions/get-repo-action.js";
import { repoKeys } from "../query-keys.js";

export const repoQueryFn = async (id: string): Promise<RepositoryData> => {
  const response = await getRepositoryAction(id);

  if (!response.success) {
    throw new Error(response.error.message);
  }

  return response.data;
};

export function useRepository(
  id: string
): UseQueryResult<RepositoryData, Error> {
  return useQuery({
    queryKey: repoKeys.detail(id),
    queryFn: () => repoQueryFn(id),
  });
}
