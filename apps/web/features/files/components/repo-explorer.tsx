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
  FolderTree,
  HardDrive,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
} from "lucide-react";
import React, { useCallback, useState } from "react";

interface RepositoryExplorerProps {
  readonly repositoryId: string;
}

export function RepositoryExplorer({ repositoryId }: RepositoryExplorerProps) {
  const { data: treeNodes = [], isFetching } = useRepositoryFiles(repositoryId);
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

  // Centralized batch modifier: quickly expands or contracts the entire tree layout matrix
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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 items-start w-full min-h-[calc(100vh-12rem)]">
      {/* Left Sidebar Pane: Clean Codebase Tree Topology Block */}
      <div className="lg:col-span-1 border border-border bg-card/50 rounded-xl flex flex-col h-[650px] shadow-sm overflow-hidden backdrop-blur-sm">
        <div className="h-11 border-b border-border/60 px-3 flex items-center justify-between bg-muted/20 select-none shrink-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <FolderTree className="size-3.5 text-primary/80" />
            <span>Workspace Files</span>
          </div>

          <div className="flex items-center gap-1.5">
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
            {isFetching && (
              <span
                className="size-2 rounded-full bg-primary border border-primary/40 animate-pulse"
                title="Syncing changes..."
              />
            )}
          </div>
        </div>

        {/* Dynamic Node Loop Ring */}
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          {treeNodes.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground/40 font-sans italic select-none">
              Empty directory tree.
            </div>
          ) : (
            <ul className="space-y-[2px] font-mono text-xs md:text-sm tracking-tight text-foreground/80">
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

      {/* Right Content Pane: Context-Driven Detail Presentation View Container */}
      <div className="lg:col-span-3 border border-border bg-card/30 rounded-xl h-[650px] overflow-hidden shadow-sm flex flex-col relative">
        {activeFile ? (
          <div className="flex flex-col h-full animate-in fade-in duration-200">
            {/* Active Tab Top HUD Bar */}
            <div className="h-11 border-b border-border/60 px-4 bg-muted/20 flex items-center gap-2 select-none font-mono text-xs text-muted-foreground shrink-0">
              <FileText className="size-3.5 text-muted-foreground/70" />
              <span className="text-foreground font-medium">
                {activeFile.name}
              </span>
              <span className="opacity-40">|</span>
              <span className="truncate max-w-xs md:max-w-md">
                {activeFile.relativePath}
              </span>
              {activeFile.size !== undefined && (
                <span className="ml-auto font-sans opacity-60 bg-muted px-1.5 py-0.5 rounded text-[10px]">
                  {(activeFile.size / 1024).toFixed(1)} KB
                </span>
              )}
            </div>

            {/* Document Details Shell Context Workspace (Prepped for Day 7 draw sheets) */}
            <div className="flex-1 p-6 overflow-y-auto font-sans">
              <div className="max-w-2xl border border-border bg-muted/20 rounded-lg p-5 border-dashed flex flex-col gap-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground border-b border-border pb-2">
                  <Sparkles className="size-4 text-primary" />
                  <span>AI Summary Overview</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {activeFile.summary ||
                    "This file has not been analyzed yet. The summarization worker will queue this asset shortly."}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 select-none border-2 border-dashed border-border/40 m-4 rounded-lg bg-muted/5 animate-in fade-in duration-300">
            <HardDrive className="size-10 text-muted-foreground/25 mb-3 stroke-[1.25]" />
            <h3 className="text-sm font-semibold text-foreground/70 mb-1">
              No file context active
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs leading-normal">
              Select an indexed code asset from the directory tree to review
              architecture analysis layouts.
            </p>
          </div>
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
}: TreeNodeItemProps): React.JSX.Element {
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
      {/* Core Node Action Block Line Row */}
      <div
        onClick={handleClick}
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 rounded-md transition-all duration-150 cursor-pointer group select-none relative",
          isActive
            ? "bg-primary/10 text-primary border-l-2 border-primary pl-[6px] rounded-l-none"
            : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
        )}
      >
        {/* Toggle Indicator Arrow Block */}
        <div className="size-4 flex items-center justify-center shrink-0">
          {isFolder &&
            (isOpen ? (
              <ChevronDown className="size-3.5 text-muted-foreground/60 transition-transform duration-200" />
            ) : (
              <ChevronRight className="size-3.5 text-muted-foreground/60 transition-transform duration-200" />
            ))}
        </div>

        {/* VS Code Context Icon Logic */}
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

        {/* File / Folder Label */}
        <span
          className={cn(
            "truncate font-medium transition-colors select-none",
            !isFolder && !isActive && "text-foreground/80"
          )}
        >
          {node.name}
        </span>

        {/* Subtle Completion Mapped Badges */}
        {!isFolder && node.summaryStatus === "COMPLETED" && (
          <span className="ml-auto inline-flex items-center text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-sans border border-primary/10 select-none scale-90 opacity-90">
            Mapped
          </span>
        )}
      </div>

      {/* Recursive Deep Render Execution Track */}
      {isFolder && isOpen && node.children.length > 0 && (
        <div className="pl-3.5 ml-2 border-l border-border/40 mt-[2px] space-y-[2px]">
          <ul className="space-y-[2px]">
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

      {/* Empty Folder Fallback View Node */}
      {isFolder && isOpen && node.children.length === 0 && (
        <div className="pl-8 py-1 text-[11px] text-muted-foreground/30 font-sans italic select-none">
          Empty directory
        </div>
      )}
    </li>
  );
}
