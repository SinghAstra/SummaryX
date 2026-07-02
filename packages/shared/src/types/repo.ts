import { z } from "zod";

export const REPOSITORY_STATUS = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;

export const FILE_SUMMARY_STATUS = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  RETRYING: "RETRYING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;

export const repositoryStatusSchema = z.enum([
  REPOSITORY_STATUS.PENDING,
  REPOSITORY_STATUS.PROCESSING,
  REPOSITORY_STATUS.COMPLETED,
  REPOSITORY_STATUS.FAILED,
]);

export const fileSummaryStatusSchema = z.enum([
  FILE_SUMMARY_STATUS.PENDING,
  FILE_SUMMARY_STATUS.PROCESSING,
  FILE_SUMMARY_STATUS.RETRYING,
  FILE_SUMMARY_STATUS.COMPLETED,
  FILE_SUMMARY_STATUS.FAILED,
]);

export const repositoryDataSchema = z.object({
  id: z.uuid(),
  userId: z.string(),
  githubUrl: z.url(),
  name: z.string(),
  owner: z.string(),
  diskPath: z.string(),
  status: repositoryStatusSchema,
  readme: z.string().nullable(),
  totalFiles: z.number().int().nonnegative(),
  supportedFiles: z.number().int().nonnegative(),
  ignoredFiles: z.number().int().nonnegative(),
  totalFolders: z.number().int().nonnegative(),
  totalSize: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const repositoryFileDataSchema = z.object({
  id: z.uuid(),
  repositoryId: z.uuid(),
  relativePath: z.string(),
  extension: z.string(),
  size: z.number().int().nonnegative(),
  hash: z.string(),
  summaryStatus: fileSummaryStatusSchema,
  summary: z.string().nullable(),
  retryCount: z.number().int().nonnegative(),
  lastError: z.string().nullable(),
  completedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
});

export type RepositoryStatus = z.infer<typeof repositoryStatusSchema>;
export type FileSummaryStatus = z.infer<typeof fileSummaryStatusSchema>;
export type RepositoryData = z.infer<typeof repositoryDataSchema>;
export type RepositoryFileData = z.infer<typeof repositoryFileDataSchema>;
