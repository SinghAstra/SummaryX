import { apiClient } from "@/lib/api-client/client";
import {
  type ApiResponse,
  type CreateRepoResponse,
  createRepoResponseSchema,
  GetRepositoryFilesResponse,
  getRepositoryFilesResponseSchema,
  IngestRepoInput,
} from "@repo/shared";

export const repoApi = {
  ingestRepository: (
    data: IngestRepoInput
  ): Promise<ApiResponse<CreateRepoResponse>> => {
    return apiClient.post("/api/repo", data, createRepoResponseSchema);
  },
  getRepositoryFiles: (
    id: string
  ): Promise<ApiResponse<GetRepositoryFilesResponse>> => {
    return apiClient.get(
      `/api/repositories/${id}/files`,
      getRepositoryFilesResponseSchema
    );
  },
};
