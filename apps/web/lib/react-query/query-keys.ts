export const TODO_QUERY_KEYS = {
  all: ["todos"] as const,
  detail: (id: string) => [...TODO_QUERY_KEYS.all, "detail", id] as const,
} as const;
