export const repoKeys = {
  all: ["repositories"] as const,
  lists: () => [...repoKeys.all, "list"] as const,
  detail: (id: string) => [...repoKeys.all, "detail", id] as const,
  files: (id: string) => [...repoKeys.detail(id), "files"] as const,
} as const;
