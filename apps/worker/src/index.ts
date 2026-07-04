import { runSimpleAssignment } from "./ai/request-manager.js";

async function runFlowObservationTest(): Promise<void> {
  const burstCount = 40;

  const tasks = Array.from({ length: burstCount }, (_, index) =>
    runSimpleAssignment(index + 1)
  );

  const totalSuccess = tasks.filter(Boolean).length;
  console.log(`Total Success : ${totalSuccess}/${burstCount}`);

  await Promise.all(tasks);
}

void runFlowObservationTest();
