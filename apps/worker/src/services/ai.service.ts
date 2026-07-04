import { logError } from "@repo/shared";
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

const BACKOFF_BASE_MS = 1000;
const MAX_BACKOFF_MS = 5 * 60 * 1000;
const MAX_RETRIES = 10;
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

export async function runSimpleAssignment(runId: number): Promise<boolean> {
  const totalTaskStartTime = Date.now();
  let attempts = 0;

  console.log(
    `[Run ${runId}] 📡 Request starts | Initiated total track context.`
  );

  // 🟢 Step 1: Queue or Execute
  if (activeRequests >= MAX_CONCURRENT_REQUESTS) {
    // 📋 Log: Request enters queue
    console.log(`[Run ${runId}] 💤 No free slot. Request enters queue...`);

    // Suspend the execution track by pushing its resolver into our FIFO stack
    await new Promise<void>((resolve) => {
      requestQueue.push(resolve);
    });

    // 📋 Log: Request leaves queue
    console.log(`[Run ${runId}] 🔓 Slot available. Request leaves queue.`);
  }

  // 🟢 Step 2: Claim an active execution slot
  activeRequests++;

  try {
    while (attempts < MAX_RETRIES) {
      attempts++;

      if (attempts > 1) {
        // 📋 Log: Retry begins
        console.log(
          `[Run ${runId}] 🔄 Retry begins | Attempt ${attempts}/${MAX_RETRIES}`
        );
      }

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

        // 📋 Log: Request succeeds
        console.log(
          `[Run ${runId}] ✅ Request succeeds | Attempt: ${attempts}/${MAX_RETRIES} | Result: "${response.choices[0]?.message?.content?.trim()}" | Total Time: ${totalExecutionTimeSec}s`
        );
        return true;
      } catch (error: unknown) {
        // Cast to an indexed object type to bypass explicit 'any' rules safely
        const apiError = error as { status?: number; message?: string };
        const errorMessage = apiError.message || String(error);
        const errorStatus = apiError.status;

        const isTimeout = errorMessage.includes("REQUEST_TIMEOUT");
        const isTransient =
          isTimeout || errorStatus === 429 || errorMessage.includes("429");
        const errorLabel = isTimeout
          ? "TIMEOUT"
          : `HTTP_${errorStatus || "429"}`;

        console.log(
          `[Run ${runId}] ❌ Execution Failure | Attempt: ${attempts}/${MAX_RETRIES} | Class: ${errorLabel}`
        );

        if (!isTransient || attempts >= MAX_RETRIES) {
          const totalExecutionTimeSec = (
            (Date.now() - totalTaskStartTime) /
            1000
          ).toFixed(2);

          // 📋 Log: Request fails permanently
          console.log(
            `[Run ${runId}] 🚨 Request fails permanently | Closed on attempt ${attempts} | Final Elapsed Time: ${totalExecutionTimeSec}s | Details: ${errorMessage}`
          );

          // Invoke shared domain telemetry error mapping handler
          logError(error);
          return false;
        }

        const exponentialDelay = BACKOFF_BASE_MS * Math.pow(2, attempts - 1);
        const finalWait = Math.min(MAX_BACKOFF_MS, exponentialDelay);

        // 📋 Log: Backoff starts
        console.log(
          `[Run ${runId}] ⏳ Backoff starts | Suspending thread context for next ${
            finalWait / 1000
          }s...`
        );

        await new Promise((resolve) => setTimeout(resolve, finalWait));
      }
    }
    return false;
  } finally {
    // 🟢 Step 3: Free Slot & Release the Next Job
    activeRequests--;

    if (requestQueue.length > 0) {
      const nextJobResolver = requestQueue.shift();
      if (nextJobResolver) {
        nextJobResolver();
      }
    }
  }
}
