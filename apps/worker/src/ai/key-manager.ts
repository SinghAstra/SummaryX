import dotenv from "dotenv";

dotenv.config();

const rawKeysString = process.env.GROQ_API_KEY || "";

const apiKeysPool: readonly string[] = rawKeysString
  .split(",")
  .map((key) => key.trim())
  .filter((key) => key.length > 0);

if (apiKeysPool.length === 0) {
  throw new Error(
    "GROQ_CONFIG_ERROR: No valid API keys detected. Ensure GROQ_API_KEY is populated in your env."
  );
}

// 🟢 In-memory pointer to track traffic distribution states
let currentRotationIndex = 0;

export interface RotatedKeyResult {
  readonly key: string;
  readonly index: number;
}

/**
 * Returns the read-only array of all configured API keys.
 */
export function getApiKeys(): readonly string[] {
  return apiKeysPool;
}

/**
 * 🟢 Round-Robin key selection utility.
 * Sequentially selects the next available key from the memory collection array.
 */
export function getNextKey(): RotatedKeyResult {
  const index = currentRotationIndex;
  const key = apiKeysPool[index];

  if (!key) {
    throw new Error(
      "GROQ_KEY_ERROR: Selected key index evaluates to undefined."
    );
  }

  // Advance pointer and wrap around smoothly using modulo arithmetic balances
  currentRotationIndex = (currentRotationIndex + 1) % apiKeysPool.length;

  return { key, index };
}
