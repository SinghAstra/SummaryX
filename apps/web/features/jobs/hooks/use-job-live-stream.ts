"use client";

import { GetJobResponse, JOB_STATUS } from "@repo/shared";
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

    const eventSource = new EventSource(
      `https://starterx-r85m.onrender.com/api/jobs/${jobId}/events?token=${accessToken}`
    );

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        setLiveMessages((prev) => [...prev, payload.message]);

        if (payload.status) {
          if (
            payload.status === JOB_STATUS.COMPLETED ||
            payload.status === JOB_STATUS.FAILED
          ) {
            eventSource.close();

            queryClient.setQueryData(
              JOBS_QUERY_KEYS.details(jobId),
              (old: GetJobResponse) =>
                old ? { ...old, status: payload.status } : old
            );
            queryClient.invalidateQueries({
              queryKey: JOBS_QUERY_KEYS.lists(),
            });
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    eventSource.onerror = () => eventSource.close();
    return () => eventSource.close();
  }, [jobId, accessToken, queryClient]);

  return { liveMessages };
}
