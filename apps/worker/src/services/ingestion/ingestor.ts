import { prisma } from "@repo/db";
import { JOB_STATUS, REPOSITORY_STATUS, logError } from "@repo/shared";
import { trackProgress } from "@repo/shared/server";
import { getWorkspacePath } from "../../utils/workspace";

import { cloneRepository } from "./git";
import { scanWorkspace } from "./scanner";
import { dispatchSummaryJobs } from "./dispatcher";
import { syncFileIndex } from "./indexer";
import { ScanStats } from "./types";

export const ingestor = {
  async run(jobId: string) {
    console.log(`\n🚀 [Ingestor] Starting pipeline for Job: ${jobId}`);

    // 1. Fetch Job
    console.log(`⚙️ [Ingestor DB] Fetching job ${jobId}...`);

    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!job) {
      console.log(`❌ [Ingestor DB] Job ${jobId} not found. Aborting.`);

      return;
    }

    // 2. Fetch Repository
    console.log(`⚙️ [Ingestor DB] Fetching repository ${job.repositoryId}...`);

    const repo = await prisma.repository.findUnique({
      where: { id: job.repositoryId },
    });

    if (!repo) {
      console.log(
        `❌ [Ingestor DB] Repository ${job.repositoryId} not found. Aborting.`
      );

      return;
    }

    const workspacePath = getWorkspacePath(repo.id);

    try {
      // 3. Mark Job as Running
      console.log(
        `⚙️ [Ingestor DB] Updating job ${jobId} status to RUNNING...`
      );

      await prisma.job.update({
        where: { id: jobId },
        data: { status: JOB_STATUS.RUNNING, startedAt: new Date() },
      });

      console.log(`✅ [Ingestor DB] Job status updated.`);

      await trackProgress({
        jobId,
        repositoryId: repo.id,
        status: JOB_STATUS.RUNNING,
        message: "Synchronizing workspace...",
      });

      // 4. Pull Code
      await cloneRepository(workspacePath, repo.githubUrl);

      await trackProgress({
        jobId,
        repositoryId: repo.id,
        status: JOB_STATUS.RUNNING,
        message: "Scanning files...",
      });

      // 5. Scan Filesystem
      const stats: ScanStats = {
        totalFiles: 0,
        supportedFiles: 0,
        ignoredFiles: 0,
        totalFolders: 0,
        totalSize: BigInt(0),
        collectedFiles: [],
      };

      await scanWorkspace(workspacePath, workspacePath, stats);

      // 6. Sync File State to DB (Heavy logging is handled inside this function)
      const { addedCount, modifiedCount, deletedCount, targetsToQueue } =
        await syncFileIndex(repo.id, stats);

      await trackProgress({
        jobId,
        repositoryId: repo.id,
        status: JOB_STATUS.RUNNING,
        message: `Updated index (${addedCount} added, ${modifiedCount} modified, ${deletedCount} deleted)...`,
      });

      // 7. Dispatch or Complete
      if (targetsToQueue.length > 0) {
        await dispatchSummaryJobs(repo.id, jobId, targetsToQueue);

        await trackProgress({
          jobId,
          repositoryId: repo.id,
          status: JOB_STATUS.RUNNING,
          message: `Initializing AI analysis for ${targetsToQueue.length} files...`,
        });
      } else {
        // No files to process, mark everything complete immediately
        console.log(
          `⚙️ [Ingestor DB] No new files. Updating repo ${repo.id} to COMPLETED...`
        );

        await prisma.repository.update({
          where: { id: repo.id },
          data: { status: REPOSITORY_STATUS.COMPLETED },
        });

        console.log(`⚙️ [Ingestor DB] Updating job ${jobId} to COMPLETED...`);

        await prisma.job.update({
          where: { id: jobId },
          data: { status: JOB_STATUS.COMPLETED, completedAt: new Date() },
        });

        console.log(`✅ [Ingestor DB] Job & Repo marked as COMPLETED.`);

        await trackProgress({
          jobId,
          repositoryId: repo.id,
          status: JOB_STATUS.COMPLETED,
          message: "Workspace is up to date.",
        });
      }
    } catch (error) {
      logError(error);

      console.log(`⚙️ [Ingestor DB] Updating job ${jobId} to FAILED...`);

      await prisma.job.update({
        where: { id: jobId },
        data: { status: JOB_STATUS.FAILED },
      });

      console.log(`⚙️ [Ingestor DB] Updating repo ${repo.id} to FAILED...`);

      await prisma.repository.update({
        where: { id: repo.id },
        data: { status: REPOSITORY_STATUS.FAILED },
      });

      console.log(`✅ [Ingestor DB] Failure states saved.`);

      await trackProgress({
        jobId,
        repositoryId: repo.id,
        status: JOB_STATUS.FAILED,
        message: "Process failed. Please try again.",
      });

      logError(error);

      throw error; // Re-throw so BullMQ registers the job as failed
    }
  },
};
