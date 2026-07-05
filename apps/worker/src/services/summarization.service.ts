import { prisma } from "@repo/db";
import { FILE_SUMMARY_STATUS, logError } from "@repo/shared";
import fs from "node:fs/promises";
import path from "node:path";
import { executeAIRequest } from "../ai/request-manager.js";

export const summarizationService = {
  async processFileSummary(
    fileId: string,
    repositoryId: string,
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
    } catch (error) {
      logError(error);
      await prisma.repositoryFile.update({
        where: { id: fileId },
        data: { summaryStatus: FILE_SUMMARY_STATUS.FAILED },
      });
      throw error;
    }
  },
};
