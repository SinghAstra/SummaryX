"use client";

import { ErrorFallback } from "@/components/reusable/error-fallback";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function JobsError({ error, reset }: ErrorProps) {
  return (
    <ErrorFallback
      pageName="Jobs"
      error={error}
      reset={reset}
      fallbackHref="/jobs"
    />
  );
}
