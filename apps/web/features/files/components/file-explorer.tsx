"use client";

import { buildFileTree, TreeNode } from "@/lib/file-tree";
import type { RepositoryFileData } from "@repo/shared";
import { ChevronDown, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { FileTree } from "./file-tree";

interface FileExplorerProps {
  files: RepositoryFileData[];
  onFileSelect?: (file: TreeNode) => void;
  selectedPath?: string;
}

export function FileExplorer({
  files,
  onFileSelect,
  selectedPath,
}: FileExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedAll, setExpandedAll] = useState(false);

  const tree = useMemo(() => buildFileTree(files), [files]);

  const fileCount = files.length;
  const displayTree = tree;

  const handleExpandToggle = (): void => {
    setExpandedAll(!expandedAll);
  };

  return (
    <div className="flex flex-col h-full bg-sidebar border border-sidebar-border rounded-lg animate-in fade-in duration-300">
      <div className="flex items-center justify-between gap-2 md:gap-3 border-b border-sidebar-border px-3 md:px-4 py-2 md:py-3">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="font-semibold text-sidebar-foreground text-sm md:text-base">
            Files
          </h2>
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-medium bg-sidebar-accent/20 text-sidebar-foreground/70">
            {fileCount}
          </span>
        </div>

        <button
          onClick={handleExpandToggle}
          className="inline-flex items-center justify-center p-1 rounded transition-colors hover:bg-sidebar-accent/10 text-sidebar-foreground/60 hover:text-sidebar-foreground shrink-0"
          title={expandedAll ? "Collapse all" : "Expand all"}
          aria-label={
            expandedAll ? "Collapse all folders" : "Expand all folders"
          }
        >
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${
              expandedAll ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      <div className="flex items-center gap-2 border-b border-sidebar-border px-2 md:px-3 py-1.5 md:py-2">
        <Search size={16} className="text-sidebar-foreground/40 shrink-0" />
        <input
          type="text"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-xs md:text-sm text-sidebar-foreground placeholder:text-sidebar-foreground/40 outline-none"
          aria-label="Search files"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div role="tree" className="p-1">
          {displayTree.length > 0 ? (
            displayTree.map((node) => (
              <FileTree
                key={node.path}
                node={node}
                depth={0}
                onSelect={onFileSelect}
                selectedPath={selectedPath}
              />
            ))
          ) : (
            <div className="p-4 text-center text-xs md:text-sm text-sidebar-foreground/60">
              No files found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
