import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error(
    "GROQ_CONFIG_ERROR: No Groq API key detected in environment variables."
  );
}

const groq = new Groq({ apiKey });

// ============================================================================
// 📋 CONFIGURATION & QUEUE REGISTERS
// ============================================================================
const BACKOFF_BASE_MS = 1000;
const MAX_BACKOFF_MS = 5 * 60 * 1000;
const MAX_RETRIES = 10;
const REQUEST_TIMEOUT_MS = 10000;

const MAX_CONCURRENT_REQUESTS = 3;
let activeRequests = 0;

// 🟢 Assignment 9: Array holding the resolve hooks of sleeping jobs (FIFO Queue)
const requestQueue: (() => void)[] = [];

/**
 * Wraps a promise in a race against a localized execution timer
 */
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

export async function runSimpleAssignment(runId: number): Promise<boolean> {
  // 🟢 Step 1: Queue or Execute
  if (activeRequests >= MAX_CONCURRENT_REQUESTS) {
    console.log(
      `[Run ${runId}] 💤 No free slot. Entering the request queue...`
    );

    // Suspend the execution track by pushing its resolver into our FIFO stack
    await new Promise<void>((resolve) => {
      requestQueue.push(resolve);
    });
  }

  // 🟢 Step 2: Claim an active execution slot
  activeRequests++;

  const totalTaskStartTime = Date.now();
  let attempts = 0;

  console.log(
    `[Run ${runId}] 📡 Request Start | Active Slots: ${activeRequests}/${MAX_CONCURRENT_REQUESTS} | Queue Size: ${requestQueue.length}`
  );

  try {
    while (attempts < MAX_RETRIES) {
      attempts++;

      try {
        const response = await withTimeout(
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

        const totalExecutionTimeSec = (
          (Date.now() - totalTaskStartTime) /
          1000
        ).toFixed(2);
        console.log(
          `[Run ${runId}] ✅ Success | Attempt: ${attempts}/${MAX_RETRIES} | Result: "${response.choices[0]?.message?.content?.trim()}" | Total Time: ${totalExecutionTimeSec}s`
        );
        return true;
      } catch (error: any) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        const errorStatus = error?.status;

        const isTimeout = errorMessage.includes("REQUEST_TIMEOUT");
        const isTransient =
          isTimeout ||
          errorStatus === 429 ||
          errorStatus >= 500 ||
          errorMessage.includes("429");
        const errorLabel = isTimeout
          ? "TIMEOUT"
          : `HTTP_${errorStatus || "429"}`;

        console.log(
          `[Run ${runId}] ❌ Failure | Attempt: ${attempts}/${MAX_RETRIES} | Class: ${errorLabel}`
        );

        if (!isTransient || attempts >= MAX_RETRIES) {
          const totalExecutionTimeSec = (
            (Date.now() - totalTaskStartTime) /
            1000
          ).toFixed(2);
          console.log(
            `[Run ${runId}] 🚨 Permanent Failure | Closed on attempt ${attempts} | Final Elapsed Time: ${totalExecutionTimeSec}s`
          );
          return false;
        }

        const exponentialDelay = BACKOFF_BASE_MS * Math.pow(2, attempts - 1);
        const finalWait = Math.min(MAX_BACKOFF_MS, exponentialDelay);

        await new Promise((resolve) => setTimeout(resolve, finalWait));
      }
    }
    return false;
  } finally {
    // 🟢 Step 3: Free Slot & Release the Next Job
    activeRequests--;

    if (requestQueue.length > 0) {
      // Pull the oldest waiting job out of the array (FIFO order)
      const nextJobResolver = requestQueue.shift();

      if (nextJobResolver) {
        // Trigger its promise resolution, immediately waking it up to continue
        nextJobResolver();
      }
    }
  }
}
