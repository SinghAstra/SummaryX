"use server";

import { ApiResponse, CreateRepoResponse, IngestRepoInput } from "@repo/shared";
import { repoApi } from "../api/repo-api.js";

export async function ingestRepoAction(
  values: IngestRepoInput
): Promise<ApiResponse<CreateRepoResponse>> {
  return repoApi.ingestRepository(values);
}
