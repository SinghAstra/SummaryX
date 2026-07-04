/**
 * Strict structural single source of truth for all distributed Redis keys.
 * Banish hardcoded strings across modules completely.
 */
export const REDIS_KEYS = {
  ACTIVE_COUNT: "groq:active_requests",
  QUEUE_LIST: "groq:queue_list",
  TOTAL: "groq:metrics:total",
  SUCCESS: "groq:metrics:success",
  FAILURE: "groq:metrics:failure",
  RETRIES: "groq:metrics:retries",
  LATENCY_TOTAL: "groq:metrics:latency_total",
  PEAK_QUEUE: "groq:metrics:peak_queue",
  COOL_DOWN_COUNT: "groq:metrics:cool_down_count",
} as const;

/**
 * Generates a private pub/sub lane string wrapper for a sleeping task token.
 */
export function getQueueChannelKey(workerToken: string): string {
  return `groq:queue_channel:${workerToken}`;
}

/**
 * Generates a shared cluster-wide key tracking individual key index locks.
 */
export function getCoolDownKeyPath(keyIndex: number): string {
  return `groq:cool_down:${keyIndex}`;
}

/**
 * Generates a telemetry tracking key for a specific token index signature.
 */
export function getKeyUsageMetricKey(keyIndex: number): string {
  return `groq:metrics:key_usage:${keyIndex}`;
}
