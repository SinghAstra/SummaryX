import { logError } from "@repo/shared";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import { executeWithRetry } from "./retry-manager.js";
import { withTimeout } from "./timeout.js";

dotenv.config();

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error(
    "GROQ_CONFIG_ERROR: No Groq API key detected in environment variables."
  );
}

const groq = new Groq({ apiKey });

const RETRY_CONFIG = {
  backoffBaseMs: 1000,
  maxBackoffMs: 5 * 60 * 1000,
  maxRetries: 10,
} as const;

const DEFAULT_REQUEST_TIMEOUT_MS = 10000;
const MAX_CONCURRENT_REQUESTS = 3;

let activeRequests = 0;
const requestQueue: (() => void)[] = [];

export async function runSimpleAssignment(
  runId: number,
  timeoutOverrideMs?: number
): Promise<boolean> {
  const totalTaskStartTime = Date.now();
  const currentTimeoutWindow = timeoutOverrideMs ?? DEFAULT_REQUEST_TIMEOUT_MS;

  console.log(
    `[Run ${runId}] 📡 Request starts | Initiated total track context.`
  );

  if (activeRequests >= MAX_CONCURRENT_REQUESTS) {
    console.log(`[Run ${runId}] 💤 No free slot. Request enters queue...`);
    await new Promise<void>((resolve) => {
      requestQueue.push(resolve);
    });
    console.log(`[Run ${runId}] 🔓 Slot available. Request leaves queue.`);
  }

  activeRequests++;

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
          currentTimeoutWindow
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
    activeRequests--;
    if (requestQueue.length > 0) {
      const nextJobResolver = requestQueue.shift();
      if (nextJobResolver) {
        nextJobResolver();
      }
    }
  }
}
