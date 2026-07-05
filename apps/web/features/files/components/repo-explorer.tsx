"use client";

import { useRepositoryFiles } from "@/features/repo/hooks/use-repo-files";
import { RepositoryLoadingSkeleton } from "./repo-loading-skeleton";
import { RepoTreeList } from "./tree/repo-tree-list";

interface RepositoryExplorerProps {
  readonly repositoryId: string;
  readonly expandedFolders: Set<string>;
  readonly expandedSummaries: Set<string>;
  readonly onToggleFolder: (path: string) => void;
  readonly onToggleSummary: (fileId: string) => void;
}

export function RepositoryExplorer({
  repositoryId,
  expandedFolders,
  expandedSummaries,
  onToggleFolder,
  onToggleSummary,
}: RepositoryExplorerProps) {
  const { data: treeNodes = [], isLoading } = useRepositoryFiles(repositoryId);

  if (isLoading) {
    return <RepositoryLoadingSkeleton />;
  }

  if (treeNodes.length === 0) {
    return (
      <div className="border border-border bg-card/50 rounded flex items-center justify-center text-xs text-muted-foreground/40 font-sans italic select-none py-12 backdrop-blur-sm min-h-[200px]">
        Empty directory tree.
      </div>
    );
  }

  return (
    <div className="border border-border bg-card/50 rounded flex flex-col shadow-sm h-full overflow-y-auto w-full backdrop-blur-sm">
      <div className="flex-1 p-2">
        <RepoTreeList
          nodes={treeNodes}
          expandedFolders={expandedFolders}
          expandedSummaries={expandedSummaries}
          onToggleFolder={onToggleFolder}
          onToggleSummary={onToggleSummary}
        />
      </div>
    </div>
  );
}
