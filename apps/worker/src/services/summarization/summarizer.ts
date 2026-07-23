import { prisma } from "@repo/db";
import { FILE_SUMMARY_STATUS, logError } from "@repo/shared";
import fs from "node:fs/promises";
import path from "node:path";
import { estimateTokenCount, MODEL_CONFIG } from "../../ai/model-config";
import { classifyFile } from "../../utils/file-classifier";
import { getWorkspacePath } from "../../utils/workspace";

import { summarizeChunked, summarizeDirectly } from "./generator";
import { syncProgress } from "./progress";

export const summarizer = {
  async summarizeFile(
    fileId: string,
    repositoryId: string,
    jobId: string,
    runId: number
  ) {
    console.log(
      `\n📄 [Summarizer] [Run ${runId}] Processing File ID: ${fileId}`
    );

    // 1. Fetch File Record
    console.log(
      `⚙️ [Summarizer DB] [Run ${runId}] Fetching file record ${fileId}...`
    );

    const file = await prisma.repositoryFile.findUnique({
      where: { id: fileId },
    });

    // 2. Fetch Repo Record
    console.log(
      `⚙️ [Summarizer DB] [Run ${runId}] Fetching repo record ${repositoryId}...`
    );

    const repo = await prisma.repository.findUnique({
      where: { id: repositoryId },
    });

    if (!file || !repo) {
      console.error(
        `❌ [Summarizer DB] Missing records for File: ${fileId} or Repo: ${repositoryId}`
      );

      throw new Error(
        `SUMMARIZATION_ERROR: Missing records for File: ${fileId} or Repo: ${repositoryId}`
      );
    }

    // 3. Mark File as Processing
    console.log(
      `⚙️ [Summarizer DB] [Run ${runId}] Setting status to PROCESSING for ${file.relativePath}...`
    );

    await prisma.repositoryFile.update({
      where: { id: fileId },
      data: { summaryStatus: FILE_SUMMARY_STATUS.PROCESSING },
    });

    const workspacePath = getWorkspacePath(repositoryId);

    try {
      const absoluteFilePath = path.join(workspacePath, file.relativePath);

      const fileContent = await fs.readFile(absoluteFilePath, "utf8");

      const classification = classifyFile(
        file.relativePath,
        path.basename(file.relativePath),
        fileContent
      );

      let summaryText = "";

      if (!classification.shouldSummarizeWithAI) {
        summaryText = classification.staticSummary;

        console.log(
          `⚡ [Summarizer] [Run ${runId}] FAST-TRACK | Bypassed AI overhead for ${classification.category}: ${file.relativePath}`
        );
      } else {
        const contentTokens = estimateTokenCount(fileContent);

        const promptTokens = 350;

        const totalEstimatedTokens = contentTokens + promptTokens;

        if (totalEstimatedTokens > MODEL_CONFIG.maxInputTokens) {
          summaryText = await summarizeChunked(
            runId,
            file.relativePath,
            fileContent
          );
        } else {
          summaryText = await summarizeDirectly(
            runId,
            file.relativePath,
            fileContent
          );
        }
      }

      // 4. Save Final Summary
      console.log(
        `⚙️ [Summarizer DB] [Run ${runId}] Saving COMPLETED summary for ${file.relativePath}...`
      );

      await prisma.repositoryFile.update({
        where: { id: fileId },
        data: {
          summary: summaryText,
          summaryStatus: FILE_SUMMARY_STATUS.COMPLETED,
        },
      });

      console.log(
        `✅ [Summarizer DB] Summary successfully saved for ${file.relativePath}`
      );

      // 5. Update Progress
      await syncProgress(repositoryId, jobId);
    } catch (error) {
      console.error(
        `💥 [Summarizer] Failed processing file ${file.relativePath}:`,
        error
      );

      logError(error);

      // 6. Handle Failure State in DB
      console.log(
        `⚙️ [Summarizer DB] [Run ${runId}] Setting status to FAILED for ${file.relativePath}...`
      );

      await prisma.repositoryFile.update({
        where: { id: fileId },
        data: { summaryStatus: FILE_SUMMARY_STATUS.FAILED },
      });

      // Still update progress so the overall job count advances
      await syncProgress(repositoryId, jobId);

      throw error;
    }
  },
};
