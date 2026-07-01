import { useQuery } from "@tanstack/react-query";
import { getJobsAction } from "../actions/get-jobs-action";
import { JOBS_QUERY_KEYS } from "../query-keys";

export const fetchJobQueryFn = async () => {
  const response = await getJobsAction();
  if (!response.success) {
    throw new Error(response.error.message);
  }
  return response.data;
};

export function useJobs() {
  return useQuery({
    queryKey: JOBS_QUERY_KEYS.lists(),
    queryFn: fetchJobQueryFn,
  });
}
