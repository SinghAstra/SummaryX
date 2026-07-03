import { apiClient } from "@/lib/api-client/client";
import {
  type ApiResponse,
  type CreateRepoResponse,
  createRepoResponseSchema,
  type GetRepositoriesResponse,
  getRepositoriesResponseSchema,
  type GetRepositoryFilesResponse,
  getRepositoryFilesResponseSchema,
  type GetRepositoryResponse,
  getRepositoryResponseSchema,
  type IngestRepoInput,
} from "@repo/shared";

export const repoApi = {
  ingestRepository: (
    data: IngestRepoInput
  ): Promise<ApiResponse<CreateRepoResponse>> => {
    return apiClient.post("/api/repo", data, createRepoResponseSchema);
  },

  getRepository: (id: string): Promise<ApiResponse<GetRepositoryResponse>> => {
    return apiClient.get(`/api/repo/${id}`, getRepositoryResponseSchema);
  },

  getRepositories: (): Promise<ApiResponse<GetRepositoriesResponse>> => {
    return apiClient.get("/api/repo", getRepositoriesResponseSchema);
  },

  getRepositoryFiles: (
    id: string
  ): Promise<ApiResponse<GetRepositoryFilesResponse>> => {
    return apiClient.get(
      `/api/repo/${id}/files`,
      getRepositoryFilesResponseSchema
    );
  },
};
