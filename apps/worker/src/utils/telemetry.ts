import { prisma } from "@repo/db";
import {
  getJobTelemetryChannel,
  TelemetryEvent,
  type JobStatus,
  type LogLevel,
} from "@repo/shared";
import { telemetryPublisher } from "../config/redis.js";

interface TelemetryOptions {
  jobId: string;
  repositoryId: string;
  status: JobStatus;
  message: string;
  logLevel?: LogLevel;
}

export async function trackProgress({
  jobId,
  repositoryId,
  status,
  message,
  logLevel,
}: TelemetryOptions) {
  if (logLevel) {
    await prisma.jobLog.create({
      data: { jobId, level: logLevel, message },
    });
  }

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
