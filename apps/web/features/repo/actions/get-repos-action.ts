"use server";

import { apiClient } from "@/lib/api-client/client.js";
import {
  getRepositoriesResponseSchema,
  type ApiResponse,
  type GetRepositoriesResponse,
} from "@repo/shared";

export async function getRepositoriesAction(): Promise<
  ApiResponse<GetRepositoriesResponse>
> {
  return apiClient.get<GetRepositoriesResponse>(
    "/api/repo",
    getRepositoriesResponseSchema
  );
}
