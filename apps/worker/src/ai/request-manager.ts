import { logError } from "@repo/shared";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import { executeWithRetry } from "./retry-manager.js";

dotenv.config();

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error(
    "GROQ_CONFIG_ERROR: No Groq API key detected in environment variables."
  );
}

const groq = new Groq({ apiKey });

// Centralized Constants Passed to Drivers
const RETRY_CONFIG = {
  backoffBaseMs: 1000,
  maxBackoffMs: 5 * 60 * 1000,
  maxRetries: 10,
} as const;

const REQUEST_TIMEOUT_MS = 10000;
const MAX_CONCURRENT_REQUESTS = 3;

let activeRequests = 0;
const requestQueue: (() => void)[] = [];

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(
        () =>
          reject(new Error("REQUEST_TIMEOUT: Groq took too long to respond.")),
        timeoutMs
      )
    ),
  ]);
}

/**
 * Unified request manager wrapper. Execution is clean, short, and highly readable.
 */
export async function runSimpleAssignment(runId: number): Promise<boolean> {
  const totalTaskStartTime = Date.now();

  console.log(
    `[Run ${runId}] 📡 Request starts | Initiated total track context.`
  );

  // Step 1: Admission Concurrency Checking Enclaves
  if (activeRequests >= MAX_CONCURRENT_REQUESTS) {
    console.log(`[Run ${runId}] 💤 No free slot. Request enters queue...`);
    await new Promise<void>((resolve) => {
      requestQueue.push(resolve);
    });
    console.log(`[Run ${runId}] 🔓 Slot available. Request leaves queue.`);
  }

  activeRequests++;

  try {
    // Step 2: Delegate Execution Logic and Retries down to the Functional Helper
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
          REQUEST_TIMEOUT_MS
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
    // Shared validation framework parsing error boundaries globally
    logError(error);
    return false;
  } finally {
    // Step 3: Guaranteed Release Lifecycles
    activeRequests--;
    if (requestQueue.length > 0) {
      const nextJobResolver = requestQueue.shift();
      if (nextJobResolver) {
        nextJobResolver();
      }
    }
  }
}
