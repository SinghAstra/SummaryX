import { ChatRole, executeAIRequest } from "./ai/request-manager.js";

async function runFlowObservationTest(): Promise<void> {
  const burstCount = 400;
  const operationStartTime = Date.now();

  console.log(
    `🚀 Flooding pipeline with ${burstCount} simultaneous generic AI jobs...`
  );

  const testPayload = {
    model: "llama-3.1-8b-instant",
    temperature: 0.1,
    messages: [
      {
        role: "user" as ChatRole,
        content: "Output exactly one Indian Youtuber name",
      },
    ],
  };

  const tasks = Array.from({ length: burstCount }, (_, index) =>
    executeAIRequest(index + 1, testPayload)
  );

  const results = await Promise.all(tasks);

  const totalSuccess = results.filter((response) => response !== null).length;

  console.log(`\n📊 --- FINAL STRESS RESULTS ---`);
  console.log(`Total Success : ${totalSuccess}/${burstCount}`);
  console.log(
    `Success Rate  : ${((totalSuccess / burstCount) * 100).toFixed(1)}%`
  );

  const totalExecutionTimeSec = (
    (Date.now() - operationStartTime) /
    1000
  ).toFixed(2);
  console.log(`Total Time Consumed : ${totalExecutionTimeSec}s`);
}

void runFlowObservationTest();
