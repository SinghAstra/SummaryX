export const JOBS_QUERY_KEYS = {
  logs: (id: string) => ["logs", id] as const,
} as const;
