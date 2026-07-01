"use server";

import { apiClient } from "@/lib/api-client/client";
import {
  GetJobsResponse,
  getJobsResponseSchema,
  type ApiResponse,
} from "@repo/shared";

export const getJobsAction = async (): Promise<
  ApiResponse<GetJobsResponse>
> => {
  return apiClient.get<GetJobsResponse>("/api/jobs", getJobsResponseSchema);
};
