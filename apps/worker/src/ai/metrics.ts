import { redisConnection } from "../config/redis.js";

const METRICS_KEYS = {
  TOTAL: "groq:metrics:total",
  SUCCESS: "groq:metrics:success",
  FAILURE: "groq:metrics:failure",
  RETRIES: "groq:metrics:retries",
  LATENCY_TOTAL: "groq:metrics:latency_total",
  PEAK_QUEUE: "groq:metrics:peak_queue",
  coolDowns: "groq:metrics:coolDowns",
  KEY_COUNTER_PREFIX: "groq:metrics:key_usage:",
} as const;

export interface ClusterMetricsSummary {
  readonly totalRequests: number;
  readonly successfulRequests: number;
  readonly failedRequests: number;
  readonly retriesCount: number;
  readonly averageLatencyMs: number;
  readonly peakQueueLength: number;
  readonly coolDownsCount: number;
  readonly requestsPerKey: Record<number, number>;
}

/**
 * Atomic telemetry tracking functions for the cluster state.
 */
export async function recordRequestStart(keyIndex: number): Promise<void> {
  await redisConnection.incr(METRICS_KEYS.TOTAL);
  await redisConnection.incr(`${METRICS_KEYS.KEY_COUNTER_PREFIX}${keyIndex}`);
}

export async function recordSuccess(latencyMs: number): Promise<void> {
  await redisConnection.incr(METRICS_KEYS.SUCCESS);
  await redisConnection.incrby(METRICS_KEYS.LATENCY_TOTAL, latencyMs);
}

export async function recordFailure(latencyMs: number): Promise<void> {
  await redisConnection.incr(METRICS_KEYS.FAILURE);
  await redisConnection.incrby(METRICS_KEYS.LATENCY_TOTAL, latencyMs);
}

export async function recordRetry(): Promise<void> {
  await redisConnection.incr(METRICS_KEYS.RETRIES);
}

export async function recordCoolDownTriggered(): Promise<void> {
  await redisConnection.incr(METRICS_KEYS.coolDowns);
}

/**
 * Evaluates queue backpressure using a transaction loop to preserve the maximum peak level seen.
 */
export async function trackQueueLength(currentLength: number): Promise<void> {
  const currentPeakString = await redisConnection.get(METRICS_KEYS.PEAK_QUEUE);
  const currentPeak = currentPeakString ? parseInt(currentPeakString, 10) : 0;

  if (currentLength > currentPeak) {
    await redisConnection.set(METRICS_KEYS.PEAK_QUEUE, currentLength);
  }
}

/**
 * Resets telemetry data before starting new benchmark tests.
 */
export async function resetClusterMetrics(): Promise<void> {
  const keys = await redisConnection.keys("groq:metrics:*");
  if (keys.length > 0) {
    await redisConnection.del(...keys);
  }
}

/**
 * Computes live mathematical aggregates across all running nodes in the cluster.
 */
export async function fetchClusterTelemetry(): Promise<ClusterMetricsSummary> {
  const [total, success, failure, retries, latency, peakQueue, coolDowns] =
    await Promise.all([
      redisConnection.get(METRICS_KEYS.TOTAL),
      redisConnection.get(METRICS_KEYS.SUCCESS),
      redisConnection.get(METRICS_KEYS.FAILURE),
      redisConnection.get(METRICS_KEYS.RETRIES),
      redisConnection.get(METRICS_KEYS.LATENCY_TOTAL),
      redisConnection.get(METRICS_KEYS.PEAK_QUEUE),
      redisConnection.get(METRICS_KEYS.coolDowns),
    ]);

  const totalReq = total ? parseInt(total, 10) : 0;
  const successReq = success ? parseInt(success, 10) : 0;
  const failReq = failure ? parseInt(failure, 10) : 0;
  const totalLatency = latency ? parseInt(latency, 10) : 0;

  // Compile individual key distribution telemetry logs
  const keyUsageKeys = await redisConnection.keys(
    `${METRICS_KEYS.KEY_COUNTER_PREFIX}*`
  );
  const requestsPerKey: Record<number, number> = {};

  for (const keyPath of keyUsageKeys) {
    const indexPart = keyPath.split(":").pop();
    if (indexPart !== undefined) {
      const idx = parseInt(indexPart, 10);
      const val = await redisConnection.get(keyPath);
      requestsPerKey[idx] = val ? parseInt(val, 10) : 0;
    }
  }

  return {
    totalRequests: totalReq,
    successfulRequests: successReq,
    failedRequests: failReq,
    retriesCount: retries ? parseInt(retries, 10) : 0,
    averageLatencyMs: totalReq > 0 ? Math.round(totalLatency / totalReq) : 0,
    peakQueueLength: peakQueue ? parseInt(peakQueue, 10) : 0,
    coolDownsCount: coolDowns ? parseInt(coolDowns, 10) : 0,
    requestsPerKey,
  };
}
