import { initializeDistributedQueue } from "./ai/queue.js";

async function bootstrap() {
  await initializeDistributedQueue();

  console.log(
    "🚀 Custom concurrency queue tracking systems initialized cleanly."
  );
}

void bootstrap();

export * from "./workers/ingestion.worker.js";
export * from "./workers/summarization.worker.js";
