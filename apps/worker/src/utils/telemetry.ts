import { prisma } from "@repo/db";
import {
  getJobTelemetryChannel,
  TelemetryEvent,
  type JobStatus,
} from "@repo/shared";
import { telemetryPublisher } from "../config/redis.js";

interface TelemetryOptions {
  jobId: string;
  repositoryId: string;
  status: JobStatus;
  message: string;
}

export async function trackProgress({
  jobId,
  repositoryId,
  status,
  message,
}: TelemetryOptions) {
  await prisma.jobLog.create({
    data: { jobId, message },
  });

  const channelCoordinate = getJobTelemetryChannel(jobId);
  const eventPayload: TelemetryEvent = {
    repositoryId,
    status,
    message,
    timestamp: new Date().toISOString(),
  };

  console.log("eventPayload is ", eventPayload);

  await telemetryPublisher.publish(
    channelCoordinate,
    JSON.stringify(eventPayload)
  );
}
