"use client";

export interface ErrorClassification {
  isRetryable: boolean;
  isPermanent: boolean;
  isTimeout: boolean;
  isRateLimit: boolean;
  isServerError: boolean;
  isPayloadTooLarge: boolean;
  label: string;
}

export function classifyError(error: unknown): ErrorClassification {
  const apiError = error as {
    status?: number;
    message?: string;
    error?: { code?: string; type?: string };
  };

  const errorMessage = apiError.message || String(error);
  const status = apiError.status;
  const errorCode = apiError.error?.code || "";
  const errorType = apiError.error?.type || "";

  const isTimeout =
    errorMessage.includes("REQUEST_TIMEOUT") ||
    errorMessage.includes("timeout") ||
    status === 408;

  const isRateLimit =
    status === 429 ||
    errorMessage.includes("429") ||
    errorCode === "rate_limit_exceeded" ||
    errorType === "tokens";

  const isPayloadTooLarge =
    status === 413 ||
    errorMessage.includes("413") ||
    errorMessage.includes("Request too large") ||
    errorMessage.includes("payload_too_large");

  const isServerError = status !== undefined && status >= 500;

  const isRetryable =
    (isTimeout || isRateLimit || isServerError) && !isPayloadTooLarge;
  const isPermanent = !isRetryable;

  let label = "UNKNOWN_ERROR";
  if (isTimeout) label = "TIMEOUT";
  else if (isRateLimit) label = "RATE_LIMIT";
  else if (isPayloadTooLarge) label = "REQUEST_TOO_LARGE";
  else if (isServerError) label = `SERVER_ERROR_HTTP_${status}`;
  else if (status) label = `CLIENT_ERROR_HTTP_${status}`;

  return {
    isRetryable,
    isPermanent,
    isTimeout,
    isRateLimit,
    isServerError,
    isPayloadTooLarge,
    label,
  };
}
