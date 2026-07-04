import { runSimpleAssignment } from "./groq-key-manager";

async function executeTestBatch(size: number) {
  console.log(`\n🚀 --- STARTING BATCH SIZE: ${size} ---`);
  const batchStartTime = Date.now();

  // Dynamically pack the array based on the requested stress size
  const batchArray = Array.from({ length: size }, (_, index) =>
    runSimpleAssignment(index + 1)
  );

  // Wait for the entire concurrent flood tier to resolve
  const results = await Promise.all(batchArray);

  const totalDuration = ((Date.now() - batchStartTime) / 1000).toFixed(2);
  const successCount = results.filter(Boolean).length;

  console.log(`📊 --- BATCH RESULT ---`);
  console.log(
    `Size: ${size} | Success Rate: ${successCount}/${size} | Total Time: ${totalDuration}s\n`
  );
}

async function startTestSuite() {
  // Test 5 requests
  await executeTestBatch(25);

  // Test 10 requests
  await executeTestBatch(50);

  // Test 20 requests
  await executeTestBatch(200);
}

void startTestSuite();
