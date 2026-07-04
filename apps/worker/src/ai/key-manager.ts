import dotenv from "dotenv";

dotenv.config();

interface ApiKeyStatus {
  readonly key: string;
  coolDownExpiry: number;
}

const rawKeysString = process.env.GROQ_API_KEY || "";

// Transform the split string collection into mutable state tracks
const apiKeysPool: ApiKeyStatus[] = rawKeysString
  .split(",")
  .map((key) => key.trim())
  .filter((key) => key.length > 0)
  .map((key) => ({
    key,
    coolDownExpiry: 0,
  }));

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
 * Places a specific key index on coolDown until the calculated expiry threshold settles.
 */
export function coolDownKey(index: number, durationMs: number): void {
  const keyState = apiKeysPool[index];
  if (keyState) {
    keyState.coolDownExpiry = Date.now() + durationMs;
    console.log(
      `🔒 [Key Registry] Index ${index} entered cooldown state for next ${
        durationMs / 1000
      }s.`
    );
  }
}

/**
 * Round-Robin key selection utility.
 * Automatically skips unhealthy keys that are inside an active coolDown window.
 */
export function getNextKey(): RotatedKeyResult {
  const poolLength = apiKeysPool.length;
  const now = Date.now();

  // Scan the array pool starting from our current rotation pointer position
  for (let i = 0; i < poolLength; i++) {
    const checkIndex = (currentRotationIndex + i) % poolLength;
    const keyState = apiKeysPool[checkIndex];

    if (keyState && now >= keyState.coolDownExpiry) {
      // Key is healthy! Claim it, advance the master index pointer, and return
      currentRotationIndex = (checkIndex + 1) % poolLength;
      return { key: keyState.key, index: checkIndex };
    }
  }

  // Fallback safety gate: If all keys are cooling down, do not stall the thread.
  // Pull the next round-robin key anyway, allowing retry managers to handle backoffs.
  const fallbackIndex = currentRotationIndex;
  currentRotationIndex = (currentRotationIndex + 1) % poolLength;

  console.log(
    `⚠️ [Key Registry] All keys are cooling down. Falling back to Index ${fallbackIndex}.`
  );

  const fallbackKey = apiKeysPool[fallbackIndex];
  if (!fallbackKey) {
    throw new Error("GROQ_KEY_ERROR: Fallback tracking resolution failed.");
  }

  return { key: fallbackKey.key, index: fallbackIndex };
}
