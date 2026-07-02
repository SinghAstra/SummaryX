import { prisma } from "@repo/db";
import {
  COMMON_ERROR_CODES,
  parseGitHubUrl,
  RepositoryStatus,
} from "@repo/shared";
import crypto from "node:crypto";
import os from "node:os";
import path from "node:path";
import { BadRequestError, NotFoundError } from "../errors/api-errors.js";

interface IngestParams {
  readonly userId: string;
  readonly githubUrl: string;
}

export const repositoryService = {
  async createRepository(params: IngestParams) {
    const { userId, githubUrl } = params;
    let owner: string;
    let name: string;

    try {
      const parsed = parseGitHubUrl(githubUrl);
      owner = parsed.owner;
      name = parsed.name;
    } catch {
      throw new BadRequestError(
        COMMON_ERROR_CODES.SCHEMA_MISMATCH,
        "Invalid GitHub URL format."
      );
    }

    try {
      const pingResponse = await fetch(githubUrl, {
        method: "HEAD",
        redirect: "follow",
      });
      if (!pingResponse.ok) throw new Error();
    } catch {
      throw new BadRequestError(
        "REPOSITORY_UNREACHABLE",
        "Repository unreachable or private."
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
    } catch (error: any) {
      if (error?.code === "P2002") {
        const existingRepo = await prisma.repository.findFirstOrThrow({
          where: { userId, githubUrl },
        });
        return { repositoryId: existingRepo.id, isDuplicate: true };
      }
      throw error;
    }
  },

  async getRepositoryFiles(id: string, userId: string) {
    const repo = await prisma.repository.findFirst({
      where: { id, userId },
    });

    if (!repo) {
      throw new NotFoundError(
        COMMON_ERROR_CODES.ROUTE_NOT_FOUND,
        "Repository not found."
      );
    }

    return prisma.repositoryFile.findMany({
      where: { repositoryId: id },
      orderBy: { relativePath: "asc" },
    });
  },
};
