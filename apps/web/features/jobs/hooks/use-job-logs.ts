import { useQuery } from "@tanstack/react-query";
import { getJobLogsAction } from "../actions/get-job-logs-action";
import { JOBS_QUERY_KEYS } from "../query-keys";

export const getJobLogsQueryFn = async (jobId: string) => {
  const response = await getJobLogsAction(jobId);
  if (!response.success) {
    throw new Error(response.error.message);
  }
  return response.data;
};

export function useJobLogs(jobId: string) {
  return useQuery({
    queryKey: JOBS_QUERY_KEYS.logs(jobId),
    queryFn: () => getJobLogsQueryFn(jobId),
  });
}
