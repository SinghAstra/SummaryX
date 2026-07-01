"use server";

import { apiClient } from "@/lib/api-client/client";
import {
  createJobResponseSchema,
  type ApiResponse,
  type CreateJobResponse,
} from "@repo/shared";

export const createJobAction = async (): Promise<
  ApiResponse<CreateJobResponse>
> => {
  return apiClient.post<CreateJobResponse>(
    "/api/jobs",
    {},
    createJobResponseSchema
  );
};
