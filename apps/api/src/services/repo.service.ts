import { prisma } from "@repo/db";
import {
  COMMON_ERROR_CODES,
  logError,
  parseGitHubUrl,
  REPO_ERROR_CODES,
  RepositoryStatus,
} from "@repo/shared";
import crypto from "node:crypto";
import os from "node:os";
import path from "node:path";
import { BadRequestError } from "../errors/api-errors.js";

interface IngestParams {
  readonly userId: string;
  readonly githubUrl: string;
}

interface IngestResult {
  readonly repositoryId: string;
  readonly isDuplicate: boolean;
}

export const repositoryService = {
  async createRepository(params: IngestParams): Promise<IngestResult> {
    const { userId, githubUrl } = params;

    let owner: string;
    let name: string;
    try {
      const parsed = parseGitHubUrl(githubUrl);
      owner = parsed.owner;
      name = parsed.name;
      console.log("parsed is ", parsed);
    } catch {
      throw new BadRequestError(
        COMMON_ERROR_CODES.SCHEMA_MISMATCH,
        "The link format provided is invalid. Please ensure you paste a standard public GitHub repository URL (e.g., https://github.com/owner/repository)."
      );
    }

    try {
      const pingResponse = await fetch(githubUrl, {
        method: "HEAD",
        redirect: "follow",
      });
      console.log("pingResponse is ", pingResponse);

      if (!pingResponse.ok) {
        throw new Error();
      }
    } catch {
      throw new BadRequestError(
        REPO_ERROR_CODES.REPOSITORY_UNREACHABLE,
        "We couldn't reach this repository. Please confirm that the link is typed correctly and that the repository is set to public access."
      );
    }

    const repositoryId = crypto.randomUUID();
    const uniqueDiskPath = path.join(os.tmpdir(), "summary-x", repositoryId);

    try {
      const newRepo = await prisma.repository.create({
        data: {
          id: repositoryId,
          userId,
          githubUrl,
          name,
          owner,
          diskPath: uniqueDiskPath,
          status: RepositoryStatus.PENDING,
          totalSize: BigInt(0),
        },
      });
      console.log("newRepo is ", newRepo);

      return { repositoryId: newRepo.id, isDuplicate: false };
    } catch (error) {
      logError(error);
      throw error;
    }
  },
};
