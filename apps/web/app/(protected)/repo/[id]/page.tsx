import { RepositoryFileBrowser } from "@/features/files/components/repo-file-browser";
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
    <div className="w-full flex-1 flex px-4 md:px-6  flex-col gap-4 md:gap-6 animate-in fade-in duration-300">
      <RepositoryFileBrowser id={id} />
    </div>
  );
}
