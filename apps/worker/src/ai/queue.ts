import crypto from "node:crypto";
import { queueSubscriber, redisConnection } from "../config/redis.js";
import { trackQueueLength } from "./metrics.js";

const MAX_CONCURRENT_REQUESTS = 3;

const REDIS_KEYS = {
  ACTIVE_COUNT: "groq:active_requests",
  QUEUE_LIST: "groq:queue_list",
  PUB_SUB_PREFIX: "groq:queue_channel",
} as const;

const pendingResolvers = new Map<string, () => void>();

queueSubscriber.on("message", (channel: string, message: string): void => {
  if (message === "RELEASE_RELEASE") {
    const resolve = pendingResolvers.get(channel);
    if (resolve) {
      resolve();
      pendingResolvers.delete(channel);
      queueSubscriber.unsubscribe(channel).catch(() => {});
    }
  }
});

async function initializeDistributedQueue(): Promise<void> {
  try {
    await redisConnection.del(REDIS_KEYS.ACTIVE_COUNT);
    await redisConnection.del(REDIS_KEYS.QUEUE_LIST);
    console.log(
      "🧹 [Queue System] Cleaned stale distributed concurrency trackers successfully."
    );
  } catch (error: unknown) {
    console.error(
      "🚨 [Queue System] Failed to clear initialization counters:",
      error
    );
  }
}

void initializeDistributedQueue();

export async function acquire(runId: number): Promise<void> {
  const currentActive = await redisConnection.incr(REDIS_KEYS.ACTIVE_COUNT);

  if (currentActive <= MAX_CONCURRENT_REQUESTS) {
    console.log(
      `[Run ${runId}] 🟢 Slot claimed instantly via shared Redis connection.`
    );
    return;
  }

  await redisConnection.decr(REDIS_KEYS.ACTIVE_COUNT);

  const uniqueWorkerToken = crypto.randomUUID();
  const privateChannel = `${REDIS_KEYS.PUB_SUB_PREFIX}:${uniqueWorkerToken}`;

  console.log(
    `[Run ${runId}] 💤 Capacity saturated. Adding token to distributed Redis queue...`
  );

  await redisConnection.rpush(REDIS_KEYS.QUEUE_LIST, uniqueWorkerToken);

  // 🟢 Telemetry hook: check the live array length and update the peak metric gauge
  const currentQueueLength = await redisConnection.llen(REDIS_KEYS.QUEUE_LIST);
  await trackQueueLength(currentQueueLength);

  await queueSubscriber.subscribe(privateChannel);

  await new Promise<void>((resolve) => {
    pendingResolvers.set(privateChannel, resolve);
  });

  console.log(
    `[Run ${runId}] 🔓 Token released from Redis List. Continuing execution loop.`
  );
}

export async function release(): Promise<void> {
  const nextWaitingWorkerToken = await redisConnection.lpop(
    REDIS_KEYS.QUEUE_LIST
  );

  if (nextWaitingWorkerToken) {
    const privateChannel = `${REDIS_KEYS.PUB_SUB_PREFIX}:${nextWaitingWorkerToken}`;
    await redisConnection.publish(privateChannel, "RELEASE_RELEASE");
    return;
  }

  await redisConnection.decr(REDIS_KEYS.ACTIVE_COUNT);
}
