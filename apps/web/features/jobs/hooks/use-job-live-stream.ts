"use client";

import { repoKeys } from "@/features/repo/query-keys";
import { JOB_STATUS, logError } from "@repo/shared";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function useJobLiveStream(
  jobId: string,
  repositoryId: string,
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

            void queryClient.invalidateQueries({
              queryKey: repoKeys.detail(repositoryId),
            });
          }
        }
      } catch (error) {
        logError(error);
      }
    };

    eventSource.onerror = () => eventSource.close();

    return () => eventSource.close();
  }, [jobId, repositoryId, accessToken, queryClient]);

  return { liveMessages };
}
