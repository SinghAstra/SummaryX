import { classifyError } from "./error-classifier.js";

interface RetryConfig {
  readonly backoffBaseMs: number;
  readonly maxBackoffMs: number;
  readonly maxRetries: number;
}

export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig,
  runId: number,
  totalTaskStartTime: number
): Promise<T> {
  let attempts = 0;

  while (attempts < config.maxRetries) {
    attempts++;

    if (attempts > 1) {
      console.log(
        `[Run ${runId}] 🔄 Retry begins | Attempt ${attempts}/${config.maxRetries}`
      );
    }

    try {
      return await operation();
    } catch (error: unknown) {
      const classification = classifyError(error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      console.log(
        `[Run ${runId}] ❌ Execution Failure | Attempt: ${attempts}/${config.maxRetries} | Class: ${classification.label}`
      );

      // Determine if error is final or if retry allowance is exhausted
      if (classification.isPermanent || attempts >= config.maxRetries) {
        const totalExecutionTimeSec = (
          (Date.now() - totalTaskStartTime) /
          1000
        ).toFixed(2);
        console.log(
          `[Run ${runId}] 🚨 Request fails permanently | Closed on attempt ${attempts} | Final Elapsed Time: ${totalExecutionTimeSec}s | Details: ${errorMessage}`
        );
        throw error;
      }

      // Compute standard exponential backoff bounds
      const exponentialDelay = config.backoffBaseMs * Math.pow(2, attempts - 1);
      const finalWait = Math.min(config.maxBackoffMs, exponentialDelay);

      console.log(
        `[Run ${runId}] ⏳ Backoff starts | Suspending thread context for next ${
          finalWait / 1000
        }s...`
      );

      await new Promise((resolve) => setTimeout(resolve, finalWait));
    }
  }

  throw new Error(
    "RETRY_CRITICAL_EXHAUSTION: Maximum execution loop limit breached unexpectedly."
  );
}
