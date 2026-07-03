"use client";

import { JOB_STATUS, logError, type GetJobResponse } from "@repo/shared";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { JOBS_QUERY_KEYS } from "../query-keys";

export function useJobLiveStream(
  jobId: string,
  accessToken: string | undefined
) {
  const queryClient = useQueryClient();
  const [liveMessages, setLiveMessages] = useState<string[]>([]);

  useEffect(() => {
    if (!jobId || !accessToken) return;

    const sseUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${jobId}/telemetry?token=${accessToken}`;
    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload.message) {
          setLiveMessages((prev) => [...prev, payload.message]);
        }

        if (payload.status) {
          if (
            payload.status === JOB_STATUS.COMPLETED ||
            payload.status === JOB_STATUS.FAILED ||
            payload.status === JOB_STATUS.CANCELLED
          ) {
            eventSource.close();

            queryClient.setQueryData(
              JOBS_QUERY_KEYS.details(jobId),
              (old: GetJobResponse | undefined) =>
                old ? { ...old, status: payload.status } : old
            );

            void queryClient.invalidateQueries({
              queryKey: JOBS_QUERY_KEYS.lists(),
            });
          }
        }
      } catch (error) {
        logError(error);
      }
    };

    eventSource.onerror = () => eventSource.close();

    return () => eventSource.close();
  }, [jobId, accessToken, queryClient]);

  return { liveMessages };
}
