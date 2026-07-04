import { classifyError } from "./error-classifier.js";
import { recordRetry } from "./metrics.js";

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
      // 🟢 Telemetry hook
      await recordRetry();
    }

    try {
      return await operation();
    } catch (error: unknown) {
      const classification = classifyError(error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      console.log(
        `[Run ${runId}] ❌ Execution Failure | Attempt: ${attempts} | Class: ${classification.label}`
      );

      if (classification.isPermanent || attempts >= config.maxRetries) {
        throw error;
      }

      const exponentialDelay = config.backoffBaseMs * Math.pow(2, attempts - 1);
      const finalWait = Math.min(config.maxBackoffMs, exponentialDelay);
      await new Promise((resolve) => setTimeout(resolve, finalWait));
    }
  }

  throw new Error("RETRY_CRITICAL_EXHAUSTION");
}
