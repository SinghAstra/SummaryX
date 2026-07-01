import { JobsDashboard } from "@/features/jobs/components/jobs-dashboard";
import { fetchJobQueryFn } from "@/features/jobs/hooks/use-jobs";
import { JOBS_QUERY_KEYS } from "@/features/jobs/query-keys";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Jobs",
  description:
    "Monitor, trigger, and link directly to active out-of-band pipeline background clusters.",
};

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: JOBS_QUERY_KEYS.lists(),
    queryFn: fetchJobQueryFn,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <JobsDashboard />
    </HydrationBoundary>
  );
}
