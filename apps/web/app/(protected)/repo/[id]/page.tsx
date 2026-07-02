import { RepositoryExplorer } from "@/features/repo/components/repo-explorer";
import { repoFilesQueryFn } from "@/features/repo/hooks/use-repo-files";
import { repoKeys } from "@/features/repo/query-keys";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { type Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Explorer",
  description: "Review repository structures and map out code configurations.",
};

interface RepositoryPageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function RepositoryPage({ params }: RepositoryPageProps) {
  const { id } = await params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: repoKeys.files(id),
    queryFn: () => repoFilesQueryFn(id),
  });

  return (
    <div className="w-full flex-1 flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3 border-b border-border/40 pb-4 select-none">
        <Link
          href="/dashboard"
          className="p-2 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Codebase Explorer
          </h1>
          <p className="text-xs text-muted-foreground font-mono truncate max-w-50 sm:max-w-md">
            ID: {id}
          </p>
        </div>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <RepositoryExplorer repositoryId={id} />
      </HydrationBoundary>
    </div>
  );
}
