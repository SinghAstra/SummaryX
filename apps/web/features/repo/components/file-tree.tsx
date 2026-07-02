"use client";

import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  File,
  Folder,
  Sparkles,
} from "lucide-react";
import React, { useState } from "react";
import { type FileTreeNode } from "../utils/tree-builder";

interface FileTreeProps {
  nodes: FileTreeNode[];
  onFileSelect?: (path: string) => void;
}

export function FileTree({
  nodes,
  onFileSelect,
}: FileTreeProps) {
  return (
    <ul className="space-y-1 pl-1 select-none font-mono text-sm tracking-tight text-foreground/90">
      {nodes.map((node) => (
        <FileTreeItem
          key={node.relativePath}
          node={node}
          onFileSelect={onFileSelect}
        />
      ))}
    </ul>
  );
}

interface FileTreeItemProps {
  node: FileTreeNode;
  onFileSelect?: (path: string) => void;
}

function FileTreeItem({
  node,
  onFileSelect,
}: FileTreeItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isFolder = node.type === "folder";

  const handleToggle = (): void => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else if (onFileSelect) {
      onFileSelect(node.relativePath);
    }
  };

  return (
    <li className="list-none">
      <div
        onClick={handleToggle}
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 rounded-md transition-all duration-200 cursor-pointer group",
          "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
        )}
      >
        <div className="size-4 flex items-center justify-center">
          {isFolder &&
            (isOpen ? (
              <ChevronDown className="size-3.5 transition-transform" />
            ) : (
              <ChevronRight className="size-3.5 transition-transform" />
            ))}
        </div>

        {isFolder ? (
          <Folder
            className={cn(
              "size-4 text-primary/70 fill-primary/10 group-hover:text-primary",
              isOpen && "text-primary"
            )}
          />
        ) : (
          <File className="size-4 text-muted-foreground/60 group-hover:text-muted-foreground" />
        )}

        <span
          className={cn(
            "truncate font-medium",
            !isFolder && "text-foreground/80"
          )}
        >
          {node.name}
        </span>

        {!isFolder && node.summaryStatus === "COMPLETED" && (
          <span className="ml-auto inline-flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-sans border border-primary/20 animate-in fade-in duration-300">
            <Sparkles className="size-2.5" />
            Mapped
          </span>
        )}
      </div>

      {isFolder && isOpen && node.children.length > 0 && (
        <div className="pl-4 ml-2 border-l border-border/60 animate-in fade-in slide-in-from-left-2 duration-200">
          <FileTree nodes={node.children} onFileSelect={onFileSelect} />
        </div>
      )}

      {isFolder && isOpen && node.children.length === 0 && (
        <div className="pl-8 py-1 text-xs text-muted-foreground/40 font-sans italic select-none">
          Empty folder
        </div>
      )}
    </li>
  );
}
