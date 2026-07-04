import dotenv from "dotenv";
import { redisConnection } from "../config/redis.js";

dotenv.config();

const rawKeysString = process.env.GROQ_API_KEY || "";

// Maintain a static reference list of keys mapped out from the environment
const apiKeysPool: readonly string[] = rawKeysString
  .split(",")
  .map((key) => key.trim())
  .filter((key) => key.length > 0);

if (apiKeysPool.length === 0) {
  throw new Error(
    "GROQ_CONFIG_ERROR: No valid API keys detected. Ensure GROQ_API_KEY is populated in your env."
  );
}

let currentRotationIndex = 0;

export interface RotatedKeyResult {
  readonly key: string;
  readonly index: number;
}

/**
 * Places a key index on a shared cluster-wide cooldown using Redis TTL keys.
 */
export async function coolDownKey(
  index: number,
  durationMs: number
): Promise<void> {
  const redisKey = `groq:key_cooldown:${index}`;
  await redisConnection.set(redisKey, "COOLDOWN_ACTIVE", "PX", durationMs);
  console.log(
    `🔒 [Shared Key Registry] Index ${index} flagged as unhealthy across cluster for next ${
      durationMs / 1000
    }s.`
  );
}

/**
 * Distributed Round-Robin key selection utility.
 * Asynchronously cross-references active Redis keys to bypass throttled tokens instantly.
 */
export async function getNextKey(): Promise<RotatedKeyResult> {
  const poolLength = apiKeysPool.length;

  for (let i = 0; i < poolLength; i++) {
    const checkIndex = (currentRotationIndex + i) % poolLength;
    const key = apiKeysPool[checkIndex];
    const redisKey = `groq:key_cooldown:${checkIndex}`;

    // Query the shared cluster state to see if this specific index is cooling down
    const isCooledDown = await redisConnection.exists(redisKey);

    if (isCooledDown === 0 && key) {
      // Key is healthy globally! Claim it and advance rotation pointers
      currentRotationIndex = (checkIndex + 1) % poolLength;
      return { key, index: checkIndex };
    }
  }

  const fallbackIndex = currentRotationIndex;
  currentRotationIndex = (currentRotationIndex + 1) % poolLength;

  console.log(
    `⚠️ [Shared Key Registry] All keys are cooling down globally. Falling back to Index ${fallbackIndex}.`
  );

  const fallbackKey = apiKeysPool[fallbackIndex];
  if (!fallbackKey) {
    throw new Error(
      "GROQ_KEY_ERROR: Shared fallback tracking resolution failed."
    );
  }

  return { key: fallbackKey, index: fallbackIndex };
}
