export const RepositoryStatus = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;

export type RepositoryStatus =
  (typeof RepositoryStatus)[keyof typeof RepositoryStatus];

export const FileSummaryStatus = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  RETRYING: "RETRYING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;

export type FileSummaryStatus =
  (typeof FileSummaryStatus)[keyof typeof FileSummaryStatus];

export interface RepositoryData {
  id: string;
  userId: string;
  githubUrl: string;
  name: string;
  owner: string;
  diskPath: string;
  status: RepositoryStatus;
  readme: string | null;
  totalFiles: number;
  supportedFiles: number;
  ignoredFiles: number;
  totalFolders: number;
  totalSize: string;
  createdAt: string;
  updatedAt: string;
}

export interface RepositoryFileData {
  id: string;
  repositoryId: string;
  relativePath: string;
  extension: string;
  size: number;
  hash: string;
  summaryStatus: FileSummaryStatus;
  summary: string | null;
  retryCount: number;
  lastError: string | null;
  completedAt: string | null;
  createdAt: string;
}
