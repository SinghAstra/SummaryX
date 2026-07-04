const MAX_CONCURRENT_REQUESTS = 8;
let activeRequests = 0;

// Array holding the resolve hooks of sleeping execution tracks (FIFO Queue)
const requestQueue: (() => void)[] = [];

/**
 * Halts thread execution if resource slots are maxed out.
 * Resolves immediately once an execution slot becomes available.
 */
export async function acquire(runId: number): Promise<void> {
  if (activeRequests >= MAX_CONCURRENT_REQUESTS) {
    console.log(`[Run ${runId}] 💤 No free slot. Request enters queue...`);

    await new Promise<void>((resolve) => {
      requestQueue.push(resolve);
    });

    console.log(`[Run ${runId}] 🔓 Slot available. Request leaves queue.`);
  }

  activeRequests++;
  console.log(
    `[Slot Allocated] Lane claimed. Current Active Lanes: ${activeRequests}/${MAX_CONCURRENT_REQUESTS} | Queue Size: ${requestQueue.length}`
  );
}

/**
 * Releases an active slot and shifts the next suspended task out of the queue buffer.
 */
export function release(): void {
  activeRequests--;

  if (requestQueue.length > 0) {
    const nextJobResolver = requestQueue.shift();
    if (nextJobResolver) {
      nextJobResolver();
    }
  }
}
