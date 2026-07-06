import { fileSummarizationQueue } from "../queue";

async function cleanStaleSummarizationQueue() {
  try {
    await fileSummarizationQueue.obliterate({ force: true });
    console.log(
      "🧹 [Queue System] Successfully obliterated stale summarization tokens from Redis."
    );
  } catch (error: unknown) {
    console.error(
      "🚨 [Queue System] Failed to wipe stale cache frameworks:",
      error
    );
  }
}

// void cleanStaleSummarizationQueue();
