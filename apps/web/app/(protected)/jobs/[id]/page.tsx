import JobDetailPage from "@/features/jobs/components/job-detail-page";
import { getJobLogsQueryFn } from "@/features/jobs/hooks/use-job-logs";
import { JOBS_QUERY_KEYS } from "@/features/jobs/query-keys";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Job Terminal ",
  description:
    "Real-time streaming server execution terminal and worker diagnostic log stream.",
};

export default async function JobsDetailPage({ params }: PageProps) {
  const { id: jobId } = await params;
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: JOBS_QUERY_KEYS.logs(jobId),
      queryFn: () => getJobLogsQueryFn(jobId),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <JobDetailPage />
    </HydrationBoundary>
  );
}
