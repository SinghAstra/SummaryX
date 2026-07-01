import { QUEUE_NAMES } from "@repo/shared";
import { Queue } from "bullmq";
import { redisConnection } from "./redis.js";

export const infrastructureQueue = new Queue(
  QUEUE_NAMES.INFRASTRUCTURE_PIPELINE,
  {
    connection: redisConnection,
  }
);
