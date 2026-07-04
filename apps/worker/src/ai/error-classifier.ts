export interface ErrorClassification {
  readonly isRetryable: boolean;
  readonly isPermanent: boolean;
  readonly isTimeout: boolean;
  readonly isRateLimit: boolean;
  readonly isServerError: boolean;
  readonly label: string;
}

/**
 * Pure functional utility to parse and classify incoming exceptions.
 */
export function classifyError(error: unknown): ErrorClassification {
  const apiError = error as {
    status?: number;
    message?: string;
    error?: { code?: string };
  };

  const errorMessage = apiError.message || String(error);
  const status = apiError.status;
  const errorCode = apiError.error?.code || "";

  const isTimeout =
    errorMessage.includes("REQUEST_TIMEOUT") ||
    errorMessage.includes("timeout");

  const isRateLimit =
    status === 429 ||
    errorMessage.includes("429") ||
    errorCode === "rate_limit_exceeded";

  const isServerError = status !== undefined && status >= 500;

  const isRetryable = isTimeout || isRateLimit || isServerError;
  const isPermanent = !isRetryable;

  let label = "UNKNOWN_ERROR";
  if (isTimeout) label = "TIMEOUT";
  else if (isRateLimit) label = "RATE_LIMIT";
  else if (isServerError) label = `SERVER_ERROR_HTTP_${status}`;
  else if (status) label = `CLIENT_ERROR_HTTP_${status}`;

  return {
    isRetryable,
    isPermanent,
    isTimeout,
    isRateLimit,
    isServerError,
    label,
  };
}
