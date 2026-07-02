import { DashboardHeader } from "@/features/dashboard/components/header";
import { RepositoryExplorer } from "@/features/files/components/repo-explorer";
import { repoFilesQueryFn } from "@/features/repo/hooks/use-repo-files";
import { repoKeys } from "@/features/repo/query-keys";
import { QueryClient } from "@tanstack/react-query";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Repository Explorer",
  description:
    "Browse your repository structure with interactive folder navigation and file preview.",
};

interface RepositoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function RepositoryPage({ params }: RepositoryPageProps) {
  const { id } = await params;

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: repoKeys.files(id),
    queryFn: () => repoFilesQueryFn(id),
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <DashboardHeader />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 lg:p-8 w-full min-h-full flex flex-col">
          <div className="w-full flex-1 flex flex-col gap-4 md:gap-6 animate-in fade-in duration-300">
            <RepositoryExplorer repositoryId={id} />
          </div>
        </div>
      </main>
    </div>
  );
}
