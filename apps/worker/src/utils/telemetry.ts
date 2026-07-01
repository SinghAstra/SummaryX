import { prisma } from "@repo/db";
import {
  getJobTelemetryChannel,
  type JobProgressEvent,
  type JobStatus,
  type LogLevel,
} from "@repo/shared";
import { telemetryPublisher } from "../config/redis.js";

interface TelemetryOptions {
  jobId: string;
  status: JobStatus;
  message: string;
  logLevel?: LogLevel;
}

export async function trackProgress({
  jobId,
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
  const eventPayload: JobProgressEvent = { status, message };

  await telemetryPublisher.publish(
    channelCoordinate,
    JSON.stringify(eventPayload)
  );
}
