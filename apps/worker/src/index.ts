import { validateWorkerEnv } from "@repo/env";
import { initializeDistributedQueue } from "./ai/queue.js";
export * from "./workers/ingestion.worker.js";
export * from "./workers/summarization.worker.js";
validateWorkerEnv();

async function bootstrap() {
  await initializeDistributedQueue();

  console.log(
    "🚀 Custom concurrency queue tracking systems initialized cleanly."
  );
}

void bootstrap();
