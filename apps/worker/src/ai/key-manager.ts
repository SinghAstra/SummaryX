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

console.log("apiKeysPool is ", apiKeysPool);

export function getApiKeys(): readonly string[] {
  return apiKeysPool;
}
