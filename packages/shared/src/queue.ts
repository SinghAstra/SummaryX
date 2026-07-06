import { Queue, QueueOptions } from "bullmq";
import { redisConnection } from "./config/redis";
import { QUEUE_NAMES } from "./constants";
import { FileSummarizationJobData, RepoIngestionJobData } from "./schemas";

const queueOptions: QueueOptions = {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
};

export const repositoryIngestionQueue = new Queue<RepoIngestionJobData>(
  QUEUE_NAMES.REPOSITORY_INGESTION,
  queueOptions
);

export const fileSummarizationQueue = new Queue<FileSummarizationJobData>(
  QUEUE_NAMES.FILE_SUMMARIZATION,
  queueOptions
);
