"use client";

import Navbar from "@/components/repo-details/navbar";
import { Badge } from "@/components/ui/badge";
import { Directory, File, Repository } from "@prisma/client";
import {
  ChevronDown,
  ChevronRight,
  File as FileIcon,
  Folder,
} from "lucide-react";
import { User } from "next-auth";
import { useCallback, useState } from "react";

// Use the same interface from your code
export interface DirectoryWithRelations extends Directory {
  children: DirectoryWithRelations[];
  files: File[];
}

export interface StructuredRepository extends Repository {
  directories: DirectoryWithRelations[];
  rootFiles: File[];
}

interface RepoExplorerProps {
  repository: StructuredRepository;
  user: User;
}

export default function RepoExplorer({ repository, user }: RepoExplorerProps) {
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        repository={repository}
        user={user}
        showAllSummaries={showAllSummaries}
        toggleAllSummaries={toggleAllSummaries}
      />
      <div className="flex flex-col mt-20">
        <div className=" pr-4">
          {/* Directories */}
          {repository.directories.map((dir) => (
            <DirectoryTree key={dir.id} directory={dir} />
          ))}

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
        </div>
      </div>
    </div>
  );
}
