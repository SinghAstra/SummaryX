export const QUEUE_NAMES = {
  INFRASTRUCTURE_PIPELINE: "infrastructure-pipeline",
} as const;

export const JOB_NAMES = {
  PIPELINE_PARSE: "pipeline-parse-task",
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

export const getJobTelemetryChannel = (jobId: string): string => {
  return `job:telemetry:${jobId}`;
};
