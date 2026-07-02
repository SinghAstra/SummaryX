import { type RepositoryFileData } from "@repo/shared";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getRepositoryFilesAction } from "../actions/get-repo-files-action.js";
import { repoKeys } from "../query-keys.js";

export const repoFilesQueryFn = async (
  id: string
): Promise<RepositoryFileData[]> => {
  const response = await getRepositoryFilesAction(id);

  if (!response.success) {
    throw new Error(response.error.message);
  }

  return response.data;
};

export function useRepositoryFiles(
  id: string
): UseQueryResult<RepositoryFileData[], Error> {
  return useQuery({
    queryKey: repoKeys.files(id),
    queryFn: () => repoFilesQueryFn(id),
  });
}
