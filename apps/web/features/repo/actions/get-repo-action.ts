"use server";

import { apiClient } from "@/lib/api-client/client";
import {
  GetRepositoryResponse,
  getRepositoryResponseSchema,
  type ApiResponse,
} from "@repo/shared";

export async function getRepositoryAction(
  id: string
): Promise<ApiResponse<GetRepositoryResponse>> {
  return apiClient.get<GetRepositoryResponse>(
    `/api/repo/${id}`,
    getRepositoryResponseSchema
  );
}
