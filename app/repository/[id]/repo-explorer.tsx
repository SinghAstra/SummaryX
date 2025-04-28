"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Directory, File, Repository } from "@prisma/client";
import {
  ChevronDown,
  ChevronRight,
  Copy,
  File as FileIcon,
  Folder,
} from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

// Use the same interface from your code
interface DirectoryWithRelations extends Directory {
  children: DirectoryWithRelations[];
  files: File[];
}

interface StructuredRepository extends Repository {
  directories: DirectoryWithRelations[];
  rootFiles: File[];
  files: File[];
}

interface RepoExplorerProps {
  repository: StructuredRepository;
}

export default function RepoExplorer({ repository }: RepoExplorerProps) {
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [showAllSummaries, setShowAllSummaries] = useState(false);

  const toggleDir = useCallback((dirId: string) => {
    setExpandedDirs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dirId)) {
        newSet.delete(dirId);
      } else {
        newSet.add(dirId);
      }
      return newSet;
    });
  }, []);

  const toggleAllSummaries = useCallback(() => {
    setShowAllSummaries((prev) => !prev);
  }, []);

  // Function to generate the full structured summary
  const generateFullSummary = useCallback(() => {
    let summary = `# Repository: ${repository.name} (${repository.owner})\n\n`;

    const processDirectory = (dir: DirectoryWithRelations, depth: number) => {
      const indent = "  ".repeat(depth);
      summary += `${indent}## Directory: ${dir.path}\n`;

      // Process files in this directory
      dir.files.forEach((file) => {
        summary += `${indent}- File: ${file.path}\n`;
        if (file.summary) {
          summary += `${indent}  Summary: ${file.summary}\n\n`;
        } else {
          summary += `${indent}  No summary available.\n\n`;
        }
      });

      // Process subdirectories
      dir.children.forEach((childDir) => {
        processDirectory(childDir, depth + 1);
      });
    };

    // Process root directories
    repository.directories.forEach((dir) => {
      processDirectory(dir, 1);
    });

    // Process root files
    if (repository.rootFiles.length > 0) {
      summary += `## Root Files\n`;
      repository.rootFiles.forEach((file) => {
        summary += `- File: ${file.path}\n`;
        if (file.summary) {
          summary += `  Summary: ${file.summary}\n\n`;
        } else {
          summary += `  No summary available.\n\n`;
        }
      });
    }

    return summary;
  }, [repository]);

  const copyFullSummary = useCallback(() => {
    const summary = generateFullSummary();
    navigator.clipboard
      .writeText(summary)
      .then(() => {
        toast(
          "The full repository summary has been copied and is ready to use in an LLM prompt."
        );
      })
      .catch((err) => {
        toast("There was an error copying the summary. Please try again.");
        console.error("Copy failed:", err);
      });
  }, [generateFullSummary]);

  // Recursive component for rendering directories
  const DirectoryTree = ({
    directory,
    depth = 0,
  }: {
    directory: DirectoryWithRelations;
    depth?: number;
  }) => {
    const isExpanded = expandedDirs.has(directory.id);
    const indent = depth * 16; // 16px indent per level

    return (
      <div className="pb-1">
        <div
          className="flex items-center hover:bg-gray-100 p-1 rounded cursor-pointer"
          style={{ paddingLeft: `${indent}px` }}
          onClick={() => toggleDir(directory.id)}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 mr-1" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-1" />
          )}
          <Folder className="h-4 w-4 mr-2 text-blue-500" />
          <span className="text-sm font-medium">
            {directory.path.split("/").pop()}
          </span>
          <Badge className="ml-2 text-xs" variant="outline">
            {directory.files.length} files
          </Badge>
        </div>

        {isExpanded && (
          <div>
            {directory.files.map((file) => (
              <FileItem
                key={file.id}
                file={file}
                depth={depth + 1}
                expanded={showAllSummaries}
              />
            ))}

            {directory.children.map((childDir) => (
              <DirectoryTree
                key={childDir.id}
                directory={childDir}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Component for rendering files
  const FileItem = ({
    file,
    depth = 0,
    expanded = false,
  }: {
    file: File;
    depth?: number;
    expanded?: boolean;
  }) => {
    const [isExpanded, setIsExpanded] = useState(expanded);
    const indent = depth * 16; // 16px indent per level

    return (
      <div className="pb-1">
        <div
          className="flex items-center hover:bg-gray-100 p-1 rounded cursor-pointer"
          style={{ paddingLeft: `${indent}px` }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {file.summary ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4 mr-1" />
            ) : (
              <ChevronRight className="h-4 w-4 mr-1" />
            )
          ) : (
            <span className="w-4 mr-1" />
          )}
          <FileIcon className="h-4 w-4 mr-2 text-gray-500" />
          <span className="text-sm">{file.name}</span>
          {file.summary && (
            <Badge className="ml-2 text-xs" variant="secondary">
              Summary
            </Badge>
          )}
        </div>

        {isExpanded && file.summary && (
          <div
            className="p-2 text-sm bg-gray-50 rounded mt-1 mb-2 border-l-2 border-blue-400"
            style={{ marginLeft: `${indent + 24}px` }}
          >
            {file.summary}
          </div>
        )}
      </div>
    );
  };

  const fileSummaryCount = repository.files.filter((f) => f.summary).length;
  const totalFileCount = repository.files.length;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">
          {repository.name}
          <span className="text-sm font-normal text-gray-500 ml-2">
            by {repository.owner}
          </span>
        </CardTitle>
        <Button onClick={copyFullSummary} className="flex items-center gap-2">
          <Copy className="h-4 w-4" />
          Copy Full Summary
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-between items-center">
          <div>
            <Badge variant="outline" className="mr-2">
              {totalFileCount} Files
            </Badge>
            <Badge variant="secondary">{fileSummaryCount} Summaries</Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAllSummaries}
            className="text-sm"
          >
            {showAllSummaries
              ? "Collapse All Summaries"
              : "Expand All Summaries"}
          </Button>
        </div>

        {repository.overview && (
          <Alert className="mb-4">
            <AlertDescription>
              <strong>Repository Overview:</strong> {repository.overview}
            </AlertDescription>
          </Alert>
        )}

        <ScrollArea className="h-[500px] pr-4">
          {/* Root files */}
          {repository.rootFiles.length > 0 && (
            <div className="mb-4">
              <div className="font-medium mb-1">Root Files</div>
              {repository.rootFiles.map((file) => (
                <FileItem
                  key={file.id}
                  file={file}
                  expanded={showAllSummaries}
                />
              ))}
            </div>
          )}

          {/* Directories */}
          {repository.directories.map((dir) => (
            <DirectoryTree key={dir.id} directory={dir} />
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
