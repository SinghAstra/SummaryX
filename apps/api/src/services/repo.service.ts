import { prisma } from "@repo/db";
import {
  COMMON_ERROR_CODES,
  GetRepositoriesResponse,
  JOB_NAMES,
  JOB_STATUS,
  parseGitHubUrl,
  REPOSITORY_STATUS,
  RepositoryData,
  RepositoryTreeNode,
} from "@repo/shared";
import crypto from "node:crypto";
import os from "node:os";
import path from "node:path";
import { BadRequestError, NotFoundError } from "../errors/api-errors.js";
import { buildRepositoryTree } from "../lib/build-tree.js";
import { repositoryIngestionQueue } from "../queues/ingestion.queue.js";

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

    const repositoryAvatarUrl = `https://github.com/${owner}.png`;

    try {
      const newRepo = await prisma.repository.create({
        data: {
          id: repositoryId,
          userId,
          githubUrl,
          name,
          owner,
          avatar: repositoryAvatarUrl,
          diskPath: uniqueDiskPath,
          status: REPOSITORY_STATUS.PENDING,
          totalSize: BigInt(0),
        },
      });

      const job = await prisma.job.create({
        data: {
          repositoryId: newRepo.id,
          status: JOB_STATUS.PENDING,
        },
      });

      await repositoryIngestionQueue.add(JOB_NAMES.ANALYZE_REPO, {
        jobId: job.id,
      });

      console.log("newRepo is ", newRepo);

      return { repositoryId: newRepo.id, isDuplicate: false };
    } catch (error: any) {
      throw error;
    }
  },

  async getRepositoryFiles(
    id: string,
    userId: string
  ): Promise<RepositoryTreeNode[]> {
    const repo = await prisma.repository.findFirst({
      where: { id, userId },
    });

    if (!repo) {
      throw new NotFoundError(
        COMMON_ERROR_CODES.ROUTE_NOT_FOUND,
        "Repository not found."
      );
    }

    const flatFiles = await prisma.repositoryFile.findMany({
      where: { repositoryId: id },
      orderBy: { relativePath: "asc" },
    });

    return buildRepositoryTree(flatFiles);
  },

  async getRepositoryDetail(
    id: string,
    userId: string
  ): Promise<RepositoryData> {
    const repo = await prisma.repository.findFirst({
      where: { id, userId },
    });

    if (!repo) {
      throw new NotFoundError(
        COMMON_ERROR_CODES.ROUTE_NOT_FOUND,
        "Repository not found or access denied."
      );
    }

    return {
      id: repo.id,
      userId: repo.userId,
      githubUrl: repo.githubUrl,
      name: repo.name,
      owner: repo.owner,
      avatar: repo.avatar,
      diskPath: repo.diskPath,
      status: repo.status,
      readme: repo.readme,
      totalFiles: repo.totalFiles,
      latestJobId: null,
      supportedFiles: repo.supportedFiles,
      ignoredFiles: repo.ignoredFiles,
      totalFolders: repo.totalFolders,
      totalSize: repo.totalSize.toString(),
      createdAt: repo.createdAt.toISOString(),
      updatedAt: repo.updatedAt.toISOString(),
    };
  },

  async getRepositoriesByUserId(
    userId: string
  ): Promise<GetRepositoriesResponse> {
    const records = await prisma.repository.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return records.map((repo) => ({
      id: repo.id,
      userId: repo.userId,
      githubUrl: repo.githubUrl,
      name: repo.name,
      owner: repo.owner,
      avatar: repo.avatar,
      diskPath: repo.diskPath,
      status: repo.status,
      readme: repo.readme,
      totalFiles: repo.totalFiles,
      supportedFiles: repo.supportedFiles,
      latestJobId: null,
      ignoredFiles: repo.ignoredFiles,
      totalFolders: repo.totalFolders,
      totalSize: repo.totalSize.toString(),
      createdAt: repo.createdAt.toISOString(),
      updatedAt: repo.updatedAt.toISOString(),
    }));
  },
};
