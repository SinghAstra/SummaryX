import { prisma } from "@repo/db";
import {
  FILE_SUMMARY_STATUS,
  JOB_STATUS,
  LOG_LEVEL,
  REPOSITORY_STATUS,
} from "@repo/shared";
import fs from "node:fs/promises";
import path from "node:path";
import { estimateTokenCount, MODEL_CONFIG } from "../ai/model-config.js";
import { executeAIRequest } from "../ai/request-manager.js";
import { trackProgress } from "../utils/telemetry.js";

const SYSTEM_PROMPT = `You are a product-focused technical writer. Your task is to explain why a file exists in a codebase and what its primary responsibility is.

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
"This file imports Prisma and bcrypt. It defines a function called validateUser() that checks passwords, throws an error if missing, and updates the database."`;

export async function processFileSummary(
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

    // Calculate upfront token constraints
    const contentTokens = estimateTokenCount(fileContent);
    const promptTokens = estimateTokenCount(SYSTEM_PROMPT) + 150;
    const totalEstimatedTokens = contentTokens + promptTokens;

    let summaryText = "";

    // Proactive size branching
    if (totalEstimatedTokens > MODEL_CONFIG.maxInputTokens) {
      console.log(
        `[Run ${runId}] 🔄 Action: Pre-emptively shifting to Map-Reduce chunking for: ${file.relativePath} (Estimated: ${totalEstimatedTokens} tokens)`
      );
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

    await prisma.repositoryFile.update({
      where: { id: fileId },
      data: {
        summary: summaryText,
        summaryStatus: FILE_SUMMARY_STATUS.COMPLETED,
      },
    });

    await updateGlobalProgress(repositoryId, jobId);
  } catch (error: unknown) {
    await prisma.repositoryFile.update({
      where: { id: fileId },
      data: { summaryStatus: FILE_SUMMARY_STATUS.FAILED },
    });
    throw error;
  }
}

/**
 * Directly hits the AI manager using standard payloads
 */
async function generateSummaryDirectly(
  runId: number,
  relativePath: string,
  content: string
): Promise<string> {
  const aiResponse = await executeAIRequest(runId, {
    model: MODEL_CONFIG.activeModel,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Explain why this file exists and its primary responsibility:\n\nPath: ${relativePath}\n\nContent:\n${content}`,
      },
    ],
  });
  return (
    aiResponse?.choices[0]?.message?.content?.trim() || "No summary written."
  );
}

/**
 * Map-Reduce Engine: Safely fragments text assets, summarizes pieces, and builds a merged result
 */
async function generateChunkedSummary(
  runId: number,
  relativePath: string,
  content: string
): Promise<string> {
  const targetChunkSize = Math.floor(MODEL_CONFIG.maxInputTokens * 3.2);
  const lines = content.split("\n");
  const chunks: string[] = [];
  let currentChunk = "";

  for (const line of lines) {
    if ((currentChunk + "\n" + line).length > targetChunkSize) {
      if (currentChunk) chunks.push(currentChunk);
      currentChunk = line;
    } else {
      currentChunk = currentChunk ? currentChunk + "\n" + line : line;
    }
  }
  if (currentChunk) chunks.push(currentChunk);

  console.log(
    `[Run ${runId}] 🧩 Fragmented massive file into ${chunks.length} size-compliant chunks.`
  );

  const intermediateSummaries: string[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunkResponse = await executeAIRequest(runId, {
      model: MODEL_CONFIG.activeModel,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Summary step (${i + 1}/${
            chunks.length
          }) for "${relativePath}":\n\nCode:\n${chunks[i]}`,
        },
      ],
    });
    const partialText = chunkResponse?.choices[0]?.message?.content?.trim();
    if (partialText) intermediateSummaries.push(partialText);
  }

  const unifiedPayload = intermediateSummaries
    .map((s, idx) => `Segment ${idx + 1} Summary: ${s}`)
    .join("\n\n");

  const reductionResponse = await executeAIRequest(runId, {
    model: MODEL_CONFIG.activeModel,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Synthesize these partial summaries into one cohesive overview explaining why "${relativePath}" exists and its overall responsibility:\n\n${unifiedPayload}`,
      },
    ],
  });

  return (
    reductionResponse?.choices[0]?.message?.content?.trim() ||
    "Failed synthesizing fragmented summaries."
  );
}

/**
 * Monitors and logs progress metrics to the database and telemetry
 */
async function updateGlobalProgress(
  repositoryId: string,
  jobId: string
): Promise<void> {
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
}
