"use server";

import { apiClient } from "@/lib/api-client/client.js";
import {
  repositoryDataSchema,
  type ApiResponse,
  type RepositoryData,
} from "@repo/shared";

export async function getRepositoryAction(
  id: string
): Promise<ApiResponse<RepositoryData>> {
  return apiClient.get<RepositoryData>(`/api/repo/${id}`, repositoryDataSchema);
}
