import { logError } from "@repo/shared";
import Groq from "groq-sdk";
import { getApiKeys } from "./key-manager.js";
import { acquire, release } from "./queue.js";
import { executeWithRetry } from "./retry-manager.js";
import { withTimeout } from "./timeout.js";

const keys = getApiKeys();
const primaryApiKey = keys[0];

if (!primaryApiKey) {
  throw new Error(
    "GROQ_CONFIG_ERROR: Primary API key is missing from the keys pool."
  );
}

// Initialize the client with the first parsed key string
const groq = new Groq({ apiKey: primaryApiKey });

const RETRY_CONFIG = {
  backoffBaseMs: 1000,
  maxBackoffMs: 5 * 60 * 1000,
  maxRetries: 10,
} as const;

const DEFAULT_REQUEST_TIMEOUT_MS = 10000;

/**
 * Core Request Orchestrator leveraging the environment-driven multi-key pool shell.
 */
export async function runSimpleAssignment(runId: number): Promise<boolean> {
  const totalTaskStartTime = Date.now();

  console.log(
    `[Run ${runId}] 📡 Request starts | Total Loaded Keys: ${keys.length} | Using Key Index 0`
  );

  await acquire(runId);

  try {
    const response = await executeWithRetry(
      async () => {
        return await withTimeout(
          groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
              {
                role: "user",
                content: "Output exactly one Indian Youtuber name",
              },
            ],
            temperature: 0.1,
          }),
          DEFAULT_REQUEST_TIMEOUT_MS
        );
      },
      RETRY_CONFIG,
      runId,
      totalTaskStartTime
    );

    const totalExecutionTimeSec = (
      (Date.now() - totalTaskStartTime) /
      1000
    ).toFixed(2);
    console.log(
      `[Run ${runId}] ✅ Request succeeds | Result: "${response.choices[0]?.message?.content?.trim()}" | Total Time: ${totalExecutionTimeSec}s`
    );
    return true;
  } catch (error: unknown) {
    logError(error);
    return false;
  } finally {
    release();
  }
}
