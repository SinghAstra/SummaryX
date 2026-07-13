import { prisma } from "@repo/db";
import {
  COMMON_ERROR_CODES,
  FILE_SUMMARY_STATUS,
  GetRepositoriesResponse,
  GetRepositoryResponse,
  JOB_NAMES,
  JOB_STATUS,
  parseGitHubUrl,
  REPO_ERROR_CODES,
  REPOSITORY_STATUS,
  RepositoryTreeNode,
} from "@repo/shared";
import {
  fileSummarizationQueue,
  repositoryIngestionQueue,
  trackProgress,
} from "@repo/shared/server";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { BadRequestError, NotFoundError } from "../errors/api-errors.js";
import { buildRepositoryTree } from "../lib/build-tree.js";

interface IngestParams {
  readonly userId: string;
  readonly githubUrl: string;
}

export const repositoryService = {
  async createRepository(params: IngestParams) {
    const { userId, githubUrl: rawGithubUrl } = params;
    let owner: string;
    let name: string;
    let normalizedGithubUrl: string;

    try {
      const parsed = parseGitHubUrl(rawGithubUrl);

      owner = parsed.owner.toLowerCase();
      name = parsed.name.toLowerCase();

      normalizedGithubUrl = `https://github.com/${owner}/${name}`;
    } catch {
      throw new BadRequestError(
        COMMON_ERROR_CODES.SCHEMA_MISMATCH,
        "Invalid GitHub URL format."
      );
    }

    const existingRepo = await prisma.repository.findFirst({
      where: {
        userId,
        githubUrl: normalizedGithubUrl,
      },
    });

    console.log("existingRepo is ", existingRepo);

    if (existingRepo) {
      return { repositoryId: existingRepo.id, isDuplicate: true };
    }

    try {
      const pingResponse = await fetch(normalizedGithubUrl, {
        method: "HEAD",
        redirect: "follow",
      });
      if (!pingResponse.ok) throw new Error();
    } catch {
      throw new BadRequestError(
        REPO_ERROR_CODES.REPOSITORY_UNREACHABLE,
        "Repository unreachable or private."
      );
    }

    const repositoryId = crypto.randomUUID();
    const repositoryAvatarUrl = `https://github.com/${owner}.png`;

    try {
      const newRepo = await prisma.repository.create({
        data: {
          id: repositoryId,
          userId,
          githubUrl: normalizedGithubUrl,
          name,
          owner,
          avatar: repositoryAvatarUrl,
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
        repositoryId: newRepo.id,
        isResync: false,
      });

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

    const incompleteSamples = flatFiles
      .filter((file) => file.summaryStatus !== "COMPLETED")
      .slice(0, 10);

    if (incompleteSamples.length > 0) {
      console.log(
        `⚙️ [DB-Explorer Debug] Found incomplete file summaries (${
          flatFiles.filter((f) => f.summaryStatus !== "COMPLETED").length
        } total remaining). Showing up to 10 items:`
      );
      incompleteSamples.forEach((file) => {
        console.log(
          `  ↳ 📄 Path: ${file.relativePath} | Status: [${file.summaryStatus}]`
        );
      });
    } else {
      console.log(
        `⚙️ [DB-Explorer Debug] All file summaries for repository ${id} are completely processed!`
      );
    }

    return buildRepositoryTree(flatFiles);
  },

  async getRepositoryDetail(
    id: string,
    userId: string
  ): Promise<GetRepositoryResponse> {
    const repo = await prisma.repository.findFirst({
      where: { id, userId },
      include: {
        jobs: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { id: true },
        },
      },
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
      status: repo.status,
      readme: repo.readme,
      latestJobId: repo.jobs[0]?.id || null,
      totalFiles: repo.totalFiles,
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

  async resyncRepository(
    id: string,
    userId: string
  ): Promise<{ jobId: string }> {
    const repo = await prisma.repository.findFirst({
      where: { id, userId },
    });

    if (!repo) {
      throw new NotFoundError(
        COMMON_ERROR_CODES.ROUTE_NOT_FOUND,
        "Repository not found."
      );
    }

    const job = await prisma.job.create({
      data: {
        repositoryId: id,
        status: JOB_STATUS.PENDING,
      },
    });

    await prisma.repository.update({
      where: { id },
      data: { status: REPOSITORY_STATUS.PROCESSING },
    });

    await repositoryIngestionQueue.add(JOB_NAMES.ANALYZE_REPO, {
      jobId: job.id,
      repositoryId: id,
      isResync: true,
    });

    return { jobId: job.id };
  },

  async boostRepository(id: string, userId: string) {
    const repo = await prisma.repository.findFirst({
      where: { id, userId },
      include: {
        jobs: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!repo) {
      throw new NotFoundError(
        COMMON_ERROR_CODES.ROUTE_NOT_FOUND,
        "Repository not found."
      );
    }

    const latestJob = repo.jobs[0] ?? null;

    const incompleteFiles = await prisma.repositoryFile.findMany({
      where: {
        repositoryId: id,
        summaryStatus: {
          not: FILE_SUMMARY_STATUS.COMPLETED,
        },
      },
    });

    if (incompleteFiles.length === 0) {
      await prisma.repository.update({
        where: { id },
        data: { status: REPOSITORY_STATUS.COMPLETED },
      });

      if (latestJob) {
        await prisma.job.update({
          where: { id: latestJob.id },
          data: { status: JOB_STATUS.COMPLETED, completedAt: new Date() },
        });

        await trackProgress({
          jobId: latestJob.id,
          repositoryId: id,
          status: JOB_STATUS.COMPLETED,
          message: "Sync complete. No changes found.",
        });
      }

      return { jobId: latestJob?.id || "" };
    }

    const newJob = await prisma.job.create({
      data: {
        repositoryId: id,
        status: JOB_STATUS.PENDING,
      },
    });

    await trackProgress({
      jobId: newJob.id,
      repositoryId: id,
      status: JOB_STATUS.RUNNING,
      message: "Starting Repository Boost...",
    });

    await prisma.$transaction([
      ...(latestJob && latestJob.status === JOB_STATUS.RUNNING
        ? [
            prisma.job.update({
              where: { id: latestJob.id },
              data: { status: JOB_STATUS.CANCELLED, cancelledAt: new Date() },
            }),
          ]
        : []),
      prisma.repositoryFile.updateMany({
        where: {
          repositoryId: id,
          summaryStatus: {
            not: FILE_SUMMARY_STATUS.COMPLETED,
          },
        },
        data: {
          summaryStatus: FILE_SUMMARY_STATUS.PENDING,
          retryCount: 0,
          lastError: null,
        },
      }),
    ]);

    const runId = Math.floor(Math.random() * 100000);

    await fileSummarizationQueue.addBulk(
      incompleteFiles.map((file, idx) => ({
        name: JOB_NAMES.SUMMARIZE_FILE,
        data: {
          fileId: file.id,
          repositoryId: id,
          jobId: newJob.id,
          runId: runId + idx,
        },
      }))
    );

    return { jobId: newJob.id };
  },

  async deleteRepository(id: string, userId: string) {
    const repo = await prisma.repository.findFirst({
      where: { id, userId },
    });

    if (!repo) {
      throw new NotFoundError(
        REPO_ERROR_CODES.REPO_NOT_FOUND,
        "Repository not found or access denied."
      );
    }

    await prisma.repository.delete({
      where: { id },
    });

    return { message: "Repository successfully removed." };
  },

  async deleteMultipleRepositories(ids: string[], userId: string) {
    const repos = await prisma.repository.findMany({
      where: { id: { in: ids }, userId },
      select: { id: true, diskPath: true },
    });

    if (repos.length === 0) {
      return { message: "No matching repositories found to remove." };
    }

    await prisma.repository.deleteMany({
      where: {
        id: { in: repos.map((r) => r.id) },
        userId,
      },
    });

    return { message: `${repos.length} repositories successfully removed.` };
  },
};
