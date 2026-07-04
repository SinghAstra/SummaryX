import { runSimpleAssignment } from "./services/ai.service.js";

async function runFlowObservationTest(): Promise<void> {
  const burstCount = 10;

  const tasks = Array.from({ length: burstCount }, (_, index) =>
    runSimpleAssignment(index + 1)
  );

  await Promise.all(tasks);
}

void runFlowObservationTest();
