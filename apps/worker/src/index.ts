import { runSimpleAssignment } from "./ai/request-manager.js";

async function runFlowObservationTest(): Promise<void> {
  const burstCount = 400;
  const operationStartTime = Date.now();

  console.log(`🚀 Flooding pipeline with ${burstCount} simultaneous jobs...`);

  const tasks = Array.from({ length: burstCount }, (_, index) =>
    runSimpleAssignment(index + 1)
  );

  const results: boolean[] = await Promise.all(tasks);

  const totalSuccess = results.filter(Boolean).length;

  console.log(`\n📊 --- FINAL STRESS RESULTS ---`);
  console.log(`Total Success : ${totalSuccess}/${burstCount}`);
  console.log(
    `Success Rate  : ${((totalSuccess / burstCount) * 100).toFixed(1)}%`
  );
  const totalExecutionTimeSec = (
    (Date.now() - operationStartTime) /
    1000
  ).toFixed(2);
  console.log("Total Time Consumed : ", totalExecutionTimeSec);
}

void runFlowObservationTest();
