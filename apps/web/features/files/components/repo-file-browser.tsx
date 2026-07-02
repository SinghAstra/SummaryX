"use client";

import { Button } from "@/components/ui/button";
import { useRepositoryFiles } from "@/features/repo/hooks/use-repo-files.js";
import type { TreeNode } from "@/lib/file-tree.js";
import { Code2, FileText, X } from "lucide-react";
import { useState } from "react";
import { FileExplorer } from "./file-explorer.js";

interface RepositoryFileBrowserProps {
  readonly id: string;
}

export function RepositoryFileBrowser({ id }: RepositoryFileBrowserProps) {
  const [selectedFile, setSelectedFile] = useState<TreeNode | null>(null);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const { data: files = [], isLoading, isError } = useRepositoryFiles(id);

  const handleFileSelect = (node: TreeNode): void => {
    if (node.type === "file") {
      setSelectedFile(node);
      setShowMobilePreview(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 bg-sidebar border border-sidebar-border rounded-lg p-12 flex flex-col items-center justify-center text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sidebar-primary mb-4" />
        <p className="text-sidebar-foreground/60">
          Loading repository files...
        </p>
      </div>
    );
  }

  if (isError || !files.length) {
    return (
      <div className="flex-1 bg-sidebar border border-sidebar-border rounded-lg p-12 flex flex-col items-center justify-center text-center">
        <FileText size={48} className="text-destructive/20 mb-4" />
        <h3 className="text-lg font-semibold text-destructive mb-1">
          Failed to Load Files
        </h3>
        <p className="text-sm text-sidebar-foreground/60">
          There was an error loading the repository files.
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 md:gap-6 h-full bg-background flex-col md:flex-row md:h-auto">
      <div
        className={`w-full md:w-80 md:min-w-80 md:max-w-80 transition-all duration-300 ${
          showMobilePreview ? "hidden md:block" : "block"
        }`}
      >
        <FileExplorer
          files={files}
          onFileSelect={handleFileSelect}
          selectedPath={selectedFile?.path}
        />
      </div>

      <div
        className={`flex-1 border border-sidebar-border rounded-lg overflow-hidden flex flex-col transition-all duration-300 ${
          showMobilePreview ? "block" : "hidden md:flex"
        }`}
      >
        {selectedFile && selectedFile.type === "file" ? (
          <>
            <div className="bg-sidebar-accent/10 border-b border-sidebar-border px-3 md:px-4 py-2 md:py-3 flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Code2 size={18} className="text-sidebar-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-mono text-sidebar-foreground truncate">
                    {selectedFile.path}
                  </p>
                  {selectedFile.fileData && (
                    <p className="text-xs text-sidebar-foreground/60">
                      {(selectedFile.fileData.size / 1024).toFixed(2)} KB
                    </p>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowMobilePreview(false);
                  setSelectedFile(null);
                }}
                className="md:hidden shrink-0"
                aria-label="Close preview"
              >
                <X size={18} />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 bg-sidebar">
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <p className="text-xs text-sidebar-foreground/60 uppercase tracking-wider mb-1">
                    Name
                  </p>
                  <p className="text-sm font-mono text-sidebar-foreground">
                    {selectedFile.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-sidebar-foreground/60 uppercase tracking-wider mb-1">
                    Extension
                  </p>
                  <p className="text-sm font-mono text-sidebar-foreground">
                    {selectedFile.extension || "—"}
                  </p>
                </div>
              </div>

              {selectedFile.fileData && (
                <>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <p className="text-xs text-sidebar-foreground/60 uppercase tracking-wider mb-1">
                        File Size
                      </p>
                      <p className="text-sm font-mono text-sidebar-foreground">
                        {selectedFile.fileData.size} bytes
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-sidebar-foreground/60 uppercase tracking-wider mb-1">
                        Status
                      </p>
                      <p className="text-sm">
                        <span className="inline-block px-2 py-1 rounded text-xs bg-sidebar-accent/30 text-sidebar-foreground">
                          {selectedFile.fileData.summaryStatus}
                        </span>
                      </p>
                    </div>
                  </div>

                  {selectedFile.fileData.summary && (
                    <div className="pt-3 border-t border-sidebar-border">
                      <p className="text-xs text-sidebar-foreground/60 uppercase tracking-wider mb-2">
                        Summary
                      </p>
                      <p className="text-sm text-sidebar-foreground/80 leading-relaxed">
                        {selectedFile.fileData.summary}
                      </p>
                    </div>
                  )}

                  <div className="pt-3 border-t border-sidebar-border">
                    <p className="text-xs text-sidebar-foreground/60 uppercase tracking-wider mb-2">
                      Content Hash
                    </p>
                    <p className="text-xs font-mono text-sidebar-foreground/70 break-all">
                      {selectedFile.fileData.hash}
                    </p>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 bg-sidebar border border-sidebar-border rounded-lg p-6 md:p-12 flex flex-col items-center justify-center text-center">
            <FileText
              size={48}
              className="text-sidebar-foreground/20 mb-4 animate-in fade-in duration-500"
            />
            <h3 className="text-lg font-semibold text-sidebar-foreground mb-1">
              No File Selected
            </h3>
            <p className="text-sm text-sidebar-foreground/60">
              Click a file in the explorer to view its details
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
