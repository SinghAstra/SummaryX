import { z } from "zod";

const GITHUB_URL_REGEX =
  /^https?:\/\/(?:www\.)?github\.com\/([^/]+)\/([^/.]+)(?:\.git)?\/?$/;

export const ingestRepoSchema = z.object({
  githubUrl: z
    .string()
    .min(1, "GitHub repository link is required.")
    .url("Please provide a valid absolute web URL.")
    .regex(
      GITHUB_URL_REGEX,
      "Input must follow a standard public GitHub URL structure (e.g., https://github.com/owner/repo)."
    ),
});

export type IngestRepoInput = z.infer<typeof ingestRepoSchema>;

export function parseGitHubUrl(url: string): { owner: string; name: string } {
  const match = url.match(GITHUB_URL_REGEX);
  if (!match || !match[1] || !match[2]) {
    throw new Error(
      "INVALID_GITHUB_SIGNATURE: Failed to extract structural parameters."
    );
  }
  return { owner: match[1], name: match[2] };
}
