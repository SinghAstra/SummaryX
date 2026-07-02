"use client";

import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  File,
  Folder,
  FolderTree,
  HardDrive,
  Sparkles,
} from "lucide-react";
import React, { useMemo } from "react";
import { useRepositoryFiles } from "../hooks/use-repo-files";
import { buildFileTree } from "../utils/tree-builder";

interface RepositoryExplorerProps {
  repositoryId: string;
}

export function RepositoryExplorer({ repositoryId }: RepositoryExplorerProps) {
  const { data: files = [], isFetching } = useRepositoryFiles(repositoryId);

  const fileTreeStructure = useMemo(() => buildFileTree(files), [files]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-start w-full">
      <div className="lg:col-span-1 border border-border bg-card/40 rounded-xl p-4 shadow-sm h-[600px] overflow-y-auto flex flex-col relative">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 border-b border-border/40 pb-2 select-none">
          <div className="flex items-center gap-2">
            <FolderTree className="size-3.5" />
            <span>Filesystem</span>
          </div>

          {isFetching && (
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded animate-pulse capitalize normal-case font-medium border border-primary/20">
              Syncing...
            </span>
          )}
        </div>

        <div className="flex-1">
          {fileTreeStructure.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground/40 font-sans italic select-none">
              No codebase files processed.
            </div>
          ) : (
            <ul className="space-y-1 pl-1 font-mono text-sm tracking-tight text-foreground/90">
              {fileTreeStructure.map((node) => (
                <FileTreeItem key={node.relativePath} node={node} />
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Details Preview Dock Area */}
      <div className="lg:col-span-2 border border-border bg-muted/10 border-dashed rounded-xl p-8 h-150 flex flex-col items-center justify-center text-center select-none">
        <HardDrive className="size-8 text-muted-foreground/30 mb-3 stroke-[1.5]" />
        <h3 className="text-sm font-semibold text-foreground/80 mb-1">
          No asset active
        </h3>
        <p className="text-xs text-muted-foreground max-w-xs">
          Select an entity node from the topology tree to read its real-time
          processing analytics.
        </p>
      </div>
    </div>
  );
}

function FileTreeItem({ node }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const isFolder = node.type === "folder";

  return (
    <li className="list-none">
      <div
        onClick={() => isFolder && setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-md transition-all duration-150 cursor-pointer group hover:bg-muted/50 text-muted-foreground hover:text-foreground"
      >
        <div className="size-4 flex items-center justify-center">
          {isFolder &&
            (isOpen ? (
              <ChevronDown className="size-3.5 animate-in fade-in" />
            ) : (
              <ChevronRight className="size-3.5 animate-in fade-in" />
            ))}
        </div>

        {isFolder ? (
          <Folder
            className={cn(
              "size-4 text-primary/70 fill-primary/5 group-hover:text-primary",
              isOpen && "text-primary"
            )}
          />
        ) : (
          <File className="size-4 text-muted-foreground/50 group-hover:text-muted-foreground" />
        )}

        <span
          className={cn(
            "truncate font-medium text-xs md:text-sm",
            !isFolder && "text-foreground/80"
          )}
        >
          {node.name}
        </span>

        {!isFolder && node.summaryStatus === "COMPLETED" && (
          <span className="ml-auto inline-flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-sans border border-primary/20 animate-in fade-in">
            <Sparkles className="size-2.5" />
            Mapped
          </span>
        )}
      </div>

      {isFolder && isOpen && node.children.length > 0 && (
        <div className="pl-4 ml-2 border-l border-border/60 animate-in fade-in slide-in-from-left-1 duration-150">
          <ul className="space-y-1 mt-1">
            {node.children.map((child) => (
              <FileTreeItem key={child.relativePath} node={child} />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}
