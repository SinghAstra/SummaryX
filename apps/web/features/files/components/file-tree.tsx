"use client";

import { getFileIcon, TreeNode } from "@/lib/file-tree";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

interface FileTreeProps {
  node: TreeNode;
  depth: number;
  onSelect?: (node: TreeNode) => void;
  selectedPath?: string;
}

export function FileTree({
  node,
  depth,
  onSelect,
  selectedPath,
}: FileTreeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isFolder = node.type === "folder";
  const hasChildren = isFolder && node.children && node.children.length > 0;
  const isSelected = selectedPath === node.path;

  const handleToggle = (): void => {
    if (isFolder) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (): void => {
    handleToggle();
    onSelect?.(node);
  };

  return (
    <div>
      <div
        className={`flex items-center gap-1 px-2 py-1.5 cursor-pointer rounded text-sm transition-colors ${
          isSelected
            ? "bg-sidebar-primary/20 text-sidebar-primary"
            : "hover:bg-sidebar-accent/10 text-sidebar-foreground"
        }`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
        onClick={handleSelect}
        aria-expanded={isFolder ? isOpen : undefined}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleSelect();
          }
        }}
      >
        {isFolder ? (
          <ChevronRight
            size={16}
            className={`shrink-0 transition-transform duration-200 ${
              isOpen ? "rotate-90" : ""
            }`}
          />
        ) : (
          <div className="w-4 shrink-0" />
        )}

        <span className="text-base">{getFileIcon(node.extension ?? "")}</span>
        <span className="truncate">{node.name}</span>
      </div>

      {isFolder && isOpen && hasChildren && (
        <div>
          {node.children?.map((child) => (
            <FileTree
              key={child.path}
              node={child}
              depth={depth + 1}
              onSelect={onSelect}
              selectedPath={selectedPath}
            />
          ))}
        </div>
      )}
    </div>
  );
}
