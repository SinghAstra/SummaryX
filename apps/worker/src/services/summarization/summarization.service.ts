import { prisma } from "@repo/db";
import { FILE_SUMMARY_STATUS, logError } from "@repo/shared";
import fs from "node:fs/promises";
import path from "node:path";
import { estimateTokenCount, MODEL_CONFIG } from "../../ai/model-config";
import { classifyFile } from "../../utils/file-classifier";
import { getWorkspacePath } from "../../utils/workspace";

import {
  generateChunkedSummary,
  generateSummaryDirectly,
} from "./generator.service";
import { updateGlobalProgress } from "./progress.service";

async function processFileSummary(
  fileId: string,
  repositoryId: string,
  jobId: string,
  runId: number
) {
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

  const workspacePath = getWorkspacePath(repositoryId);

  console.log("workspacePath is ", workspacePath);

  try {
    const absoluteFilePath = path.join(workspacePath, file.relativePath);

    const fileContent = await fs.readFile(absoluteFilePath, "utf8");

    const classification = classifyFile(
      file.relativePath,
      path.basename(file.relativePath),
      fileContent
    );

    console.log("classification is ", classification);

    let summaryText = "";

    if (!classification.shouldSummarizeWithAI) {
      summaryText = classification.staticSummary;

      console.log(
        `[Run ${runId}] ⚡ FAST-TRACK | Bypassed AI overhead for ${classification.category} resource: ${file.relativePath}`
      );
    } else {
      const contentTokens = estimateTokenCount(fileContent);

      const promptTokens = 350;

      const totalEstimatedTokens = contentTokens + promptTokens;

      if (totalEstimatedTokens > MODEL_CONFIG.maxInputTokens) {
        summaryText = await generateChunkedSummary(
          runId,
          file.relativePath,
          fileContent
        );
      } else {
        summaryText = await generateSummaryDirectly(
          runId,
          file.relativePath,
          fileContent
        );
      }
    }

    console.log("summaryText is ", summaryText);

    await prisma.repositoryFile.update({
      where: { id: fileId },
      data: {
        summary: summaryText,
        summaryStatus: FILE_SUMMARY_STATUS.COMPLETED,
      },
    });

    await updateGlobalProgress(repositoryId, jobId, workspacePath);
  } catch (error) {
    logError(error);

    await prisma.repositoryFile.update({
      where: { id: fileId },
      data: { summaryStatus: FILE_SUMMARY_STATUS.FAILED },
    });

    throw error;
  }
}

export const summarizationService = {
  processFileSummary,
};
