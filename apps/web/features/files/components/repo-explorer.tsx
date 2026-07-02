"use client";

import { Button } from "@/components/ui/button";
import { useRepositoryFiles } from "@/features/repo/hooks/use-repo-files";
import { cn } from "@/lib/utils";
import { type RepositoryTreeNode } from "@repo/shared";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  FolderOpen,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import React, { useCallback, useState } from "react";

interface RepositoryExplorerProps {
  readonly repositoryId: string;
}

export function RepositoryExplorer({ repositoryId }: RepositoryExplorerProps) {
  const { data: treeNodes = [] } = useRepositoryFiles(repositoryId);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [activeFile, setActiveFile] = useState<RepositoryTreeNode | null>(null);

  const handleToggleFolder = useCallback((path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const handleToggleAll = useCallback(() => {
    const allExpanded = expandedFolders.size > 0;

    if (allExpanded) {
      setExpandedFolders(new Set());
    } else {
      const nextSet = new Set<string>();
      const deeplyIndex = (nodes: RepositoryTreeNode[]) => {
        nodes.forEach((node) => {
          if (node.type === "folder") {
            nextSet.add(node.relativePath);
            deeplyIndex(node.children);
          }
        });
      };
      deeplyIndex(treeNodes);
      setExpandedFolders(nextSet);
    }
  }, [treeNodes, expandedFolders.size]);

  const allExpanded = expandedFolders.size > 0;

  return (
    <div className="border border-border bg-card/50 rounded flex flex-col shadow-sm overflow-hidden backdrop-blur-sm">
      <div className="h-11 border-b border-border/60 px-3 flex items-center justify-between bg-muted/20 select-none shrink-0">
        <div className="flex items-center gap-1.5 ml-auto">
          {treeNodes.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleAll}
              className="size-6 rounded-md text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              title={
                allExpanded ? "Collapse All Folders" : "Expand All Folders"
              }
            >
              {allExpanded ? (
                <PanelLeftClose className="size-3.5" />
              ) : (
                <PanelLeftOpen className="size-3.5" />
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 p-2">
        {treeNodes.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-muted-foreground/40 font-sans italic select-none">
            Empty directory tree.
          </div>
        ) : (
          <ul className="space-y-0.5 font-mono text-xs md:text-sm tracking-tight text-foreground/80">
            {treeNodes.map((node) => (
              <TreeNodeItem
                key={node.relativePath}
                node={node}
                expandedFolders={expandedFolders}
                activeFile={activeFile}
                onToggleFolder={handleToggleFolder}
                onSelectFile={setActiveFile}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

interface TreeNodeItemProps {
  readonly node: RepositoryTreeNode;
  readonly expandedFolders: Set<string>;
  readonly activeFile: RepositoryTreeNode | null;
  readonly onToggleFolder: (path: string) => void;
  readonly onSelectFile: (file: RepositoryTreeNode) => void;
}

function TreeNodeItem({
  node,
  expandedFolders,
  activeFile,
  onToggleFolder,
  onSelectFile,
}: TreeNodeItemProps) {
  const isFolder = node.type === "folder";
  const isOpen = expandedFolders.has(node.relativePath);
  const isActive = activeFile?.relativePath === node.relativePath;

  const handleClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (isFolder) {
      onToggleFolder(node.relativePath);
    } else {
      onSelectFile(node);
    }
  };

  return (
    <li className="list-none">
      <div
        onClick={handleClick}
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 rounded-md transition-all duration-150 cursor-pointer group select-none relative",
          isActive
            ? "bg-primary/10 text-primary border-l-2 border-primary pl-1.5 rounded-l-none"
            : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
        )}
      >
        <div className="size-4 flex items-center justify-center shrink-0">
          {isFolder &&
            (isOpen ? (
              <ChevronDown className="size-3.5 text-muted-foreground/60 transition-transform duration-200" />
            ) : (
              <ChevronRight className="size-3.5 text-muted-foreground/60 transition-transform duration-200" />
            ))}
        </div>

        {isFolder ? (
          isOpen ? (
            <FolderOpen className="size-4 text-primary/70 fill-primary/5 shrink-0" />
          ) : (
            <Folder className="size-4 text-primary/70 fill-primary/5 shrink-0" />
          )
        ) : (
          <FileText
            className={cn(
              "size-4 shrink-0",
              isActive
                ? "text-primary"
                : "text-muted-foreground/40 group-hover:text-muted-foreground/70"
            )}
          />
        )}

        <span
          className={cn(
            "truncate font-medium transition-colors select-none",
            !isFolder && !isActive && "text-foreground/80"
          )}
        >
          {node.name}
        </span>

        {!isFolder && node.summaryStatus === "COMPLETED" && (
          <span className="ml-auto inline-flex items-center text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-sans border border-primary/10 select-none scale-90 opacity-90">
            Mapped
          </span>
        )}
      </div>

      {isFolder && isOpen && node.children.length > 0 && (
        <div className="pl-3.5 ml-2 border-l border-border/40 mt-0.5 space-y-0.5">
          <ul className="space-y-0.5">
            {node.children.map((child) => (
              <TreeNodeItem
                key={child.relativePath}
                node={child}
                expandedFolders={expandedFolders}
                activeFile={activeFile}
                onToggleFolder={onToggleFolder}
                onSelectFile={onSelectFile}
              />
            ))}
          </ul>
        </div>
      )}

      {isFolder && isOpen && node.children.length === 0 && (
        <div className="pl-8 py-1 text-[11px] text-muted-foreground/30 font-sans italic select-none">
          Empty directory
        </div>
      )}
    </li>
  );
}
