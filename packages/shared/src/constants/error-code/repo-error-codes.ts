export const REPO_ERROR_CODES = {
  REPOSITORY_UNREACHABLE: "REPOSITORY_UNREACHABLE",
} as const;

export type RepoErrorCode = keyof typeof REPO_ERROR_CODES;
