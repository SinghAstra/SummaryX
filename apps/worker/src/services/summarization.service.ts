import { prisma } from "@repo/db";
import {
  FILE_SUMMARY_STATUS,
  JOB_STATUS,
  LOG_LEVEL,
  REPOSITORY_STATUS,
} from "@repo/shared";
import fs from "node:fs/promises";
import path from "node:path";
import { executeAIRequest } from "../ai/request-manager.js";
import { trackProgress } from "../utils/telemetry.js";

export const summarizationService = {
  async processFileSummary(
    fileId: string,
    repositoryId: string,
    jobId: string,
    runId: number
  ): Promise<void> {
    const file = await prisma.repositoryFile.findUnique({
      where: { id: fileId },
    });
    const repo = await prisma.repository.findUnique({
      where: { id: repositoryId },
    });

    if (!file || !repo) {
      throw new Error(
        `SUMMARIZATION_ERROR: Missing records for File: ${fileId} or Repo: ${repositoryId}`
      );
    }

    await prisma.repositoryFile.update({
      where: { id: fileId },
      data: { summaryStatus: FILE_SUMMARY_STATUS.PROCESSING },
    });

    try {
      const absoluteFilePath = path.join(repo.diskPath, file.relativePath);
      const fileContent = await fs.readFile(absoluteFilePath, "utf8");

      const aiResponse = await executeAIRequest(runId, {
        model: "llama-3.1-8b-instant",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You are an elite technical documentation builder. Provide a clear, high-level summary of the code.",
          },
          {
            role: "user",
            content: `Review and summarize this file:\n\nPath: ${file.relativePath}\n\nCode:\n\`\`\`\n${fileContent}\n\`\`\``,
          },
        ],
      });

      const summaryText =
        aiResponse?.choices[0]?.message?.content?.trim() ||
        "Failed to generate summary text contents.";

      await prisma.repositoryFile.update({
        where: { id: fileId },
        data: {
          summary: summaryText,
          summaryStatus: FILE_SUMMARY_STATUS.COMPLETED,
        },
      });

      const totalCount = await prisma.repositoryFile.count({
        where: { repositoryId },
      });
      const completedCount = await prisma.repositoryFile.count({
        where: { repositoryId, summaryStatus: FILE_SUMMARY_STATUS.COMPLETED },
      });

      await trackProgress({
        jobId,
        repositoryId,
        status: JOB_STATUS.RUNNING,
        logLevel: LOG_LEVEL.INFO,
        message: `Analyzing files... (${completedCount}/${totalCount})`,
      });

      if (completedCount === totalCount) {
        await prisma.repository.update({
          where: { id: repositoryId },
          data: { status: REPOSITORY_STATUS.COMPLETED },
        });

        await trackProgress({
          jobId,
          repositoryId,
          status: JOB_STATUS.COMPLETED,
          logLevel: LOG_LEVEL.INFO,
          message: "All done! Your project overview is completely ready.",
        });
      }
    } catch (error: unknown) {
      await prisma.repositoryFile.update({
        where: { id: fileId },
        data: { summaryStatus: FILE_SUMMARY_STATUS.FAILED },
      });
      throw error;
    }
  },
};
