"use client";

import { RepositoryExplorer } from "@/features/files/components/repo-explorer";
import { RepoHeader } from "@/features/repo/components/repo-header";
import { useState } from "react";

interface RepositoryWorkspaceProps {
  repo: {
    id: string;
  };
}

export function RepositoryWorkspace({ repo }: RepositoryWorkspaceProps) {
  const [isExpandedAll, setIsExpandedAll] = useState<boolean>(false);

  const handleToggleExpandAll = (): void => {
    setIsExpandedAll((prev) => !prev);
  };

  const handleCopySummaryAll = async (): Promise<void> => {
    console.log("📋 [Workspace Action] Copying all summaries to clipboard...");
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full w-full">
      <RepoHeader
        isExpandedAll={isExpandedAll}
        onToggleExpandAll={handleToggleExpandAll}
        onCopySummaryAll={handleCopySummaryAll}
      />

      <main className="flex-1 overflow-y-auto h-full p-1 md:p-2 lg:p-4 animate-in fade-in duration-300">
        <RepositoryExplorer
          repositoryId={repo.id}
          isExpandedAll={isExpandedAll}
        />
      </main>
    </div>
  );
}
