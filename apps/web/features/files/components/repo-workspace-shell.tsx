"use client";

import { RepositoryExplorer } from "@/features/files/components/repo-explorer";
import { RepoHeader } from "@/features/repo/components/repo-header";
import { useState } from "react";

interface RepoWorkspaceShellProps {
  repositoryId: string;
}

export function RepoWorkspaceShell({ repositoryId }: RepoWorkspaceShellProps) {
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

      <main className="flex-1 overflow-y-auto">
        <div className="p-1 md:p-2 lg:p-4 w-full min-h-full flex flex-col">
          <div className="w-full flex-1 flex flex-col gap-4 md:gap-6 animate-in fade-in duration-300">
            <RepositoryExplorer
              repositoryId={repositoryId}
              isExpandedAll={isExpandedAll}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
