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
        temperature: 0.1, // Stricter alignment with system framing rules
        messages: [
          {
            role: "system",
            content: `You are a product-focused technical writer. Your task is to explain why a file exists in a codebase and what its primary responsibility is.

            CRITICAL FORMATTING RULES:
            1. Return PLAIN TEXT ONLY. 
            2. Absolute ban on Markdown: No bolding (**), no lists (- or numbers), no headers (#), and no code backticks (\`).
            3. Limit the entire output to 2-3 simple sentences (under 60 words max). It must be readable in 10 seconds.

            CONTENT GUIDELINES:
            - Focus entirely on the "why" and "what" (e.g., "This service manages user sessions...").
            - Ignore small implementation details: Do NOT mention imports, specific function names, database calls, internal variables, or error handling logic.
            - Only mention interactions if they explain how the file fits into the broader application.

            GOOD EXAMPLE (What to do):
            "This service handles user authentication. It validates credentials, manages active sessions, and provides security helpers used across the application to protect private API routes."

            BAD EXAMPLE (What NOT to do):
            "This file imports Prisma and bcrypt. It defines a function called validateUser() that checks passwords, throws an error if missing, and updates the database."`,
          },
          {
            role: "user",
            content: `Explain the primary responsibility of this file and why it exists in the project:\n\nFile Path: ${file.relativePath}\n\nCode Content:\n${fileContent}`,
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
