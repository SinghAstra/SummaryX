import { logError } from "@repo/shared";
import Groq from "groq-sdk";
import { getCachedClient } from "./client-cache.js";
import { classifyError } from "./error-classifier.js";
import { coolDownKey, getNextKey } from "./key-manager.js";
import { acquire, release } from "./queue.js";
import { executeWithRetry } from "./retry-manager.js";
import { withTimeout } from "./timeout.js";

const RETRY_CONFIG = {
  backoffBaseMs: 1000,
  maxBackoffMs: 5 * 60 * 1000,
  maxRetries: 10,
} as const;

const DEFAULT_REQUEST_TIMEOUT_MS = 10000;
const COOL_DOWN_DURATION_MS = 30000;

/**
 * Core Request Orchestrator. Keeps signature strictly locked to single runId param.
 */
export async function runSimpleAssignment(runId: number): Promise<boolean> {
  const totalTaskStartTime = Date.now();
  const keyInfo = getNextKey();

  console.log(
    `[Run ${runId}] 📡 Request starts | Checked out API Key Index: ${keyInfo.index}`
  );

  await acquire(runId);

  try {
    const groq: Groq = getCachedClient(keyInfo.key, keyInfo.index);

    const response = await executeWithRetry(
      async () => {
        try {
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
        } catch (error: unknown) {
          const classification = classifyError(error);
          if (classification.isRateLimit) {
            coolDownKey(keyInfo.index, COOL_DOWN_DURATION_MS);
          }
          throw error;
        }
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
      `[Run ${runId}] ✅ Request succeeds | Used Key Index: ${keyInfo.index} | Total Time: ${totalExecutionTimeSec}s`
    );
    return true;
  } catch (error: unknown) {
    logError(error);
    return false;
  } finally {
    release();
  }
}
