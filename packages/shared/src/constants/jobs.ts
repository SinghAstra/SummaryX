export const QUEUE_NAMES = {
  REPOSITORY_INGESTION: "repository-ingestion-queue",
  FILE_SUMMARIZATION: "file-summarization-queue",
} as const;

export const JOB_NAMES = {
  ANALYZE_REPO: "analyze-repo-task",
  SUMMARIZE_FILE: "summarize-file-task",
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
export type JobName = (typeof JOB_NAMES)[keyof typeof JOB_NAMES];

export const getJobTelemetryChannel = (repositoryId: string): string => {
  return `repo:telemetry:${repositoryId}`;
};
