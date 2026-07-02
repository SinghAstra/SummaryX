import { apiClient } from "@/lib/api-client/client";
import {
  type ApiResponse,
  type CreateRepoResponse,
  createRepoResponseSchema,
  IngestRepoInput,
} from "@repo/shared";

export const repoApi = {
  ingestRepository: (
    data: IngestRepoInput
  ): Promise<ApiResponse<CreateRepoResponse>> => {
    return apiClient.post("/api/repo", data, createRepoResponseSchema);
  },
};
