export const JOBS_QUERY_KEYS = {
  all: ["jobs"] as const,
  lists: () => [...JOBS_QUERY_KEYS.all, "list"] as const,
  details: (id: string) => [...JOBS_QUERY_KEYS.all, "detail", id] as const,
  logs: (id: string) => [...JOBS_QUERY_KEYS.details(id), "logs"] as const,
} as const;
