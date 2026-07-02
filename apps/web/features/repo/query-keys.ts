export const repoKeys = {
  all: ["repositories"] as const,
  lists: () => [...repoKeys.all, "list"] as const,
  detail: (id: string) => [...repoKeys.all, "detail", id] as const,
} as const;
