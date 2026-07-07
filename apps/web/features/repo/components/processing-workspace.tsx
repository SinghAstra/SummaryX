"use client";

import { useJobLiveStream } from "@/features/jobs/hooks/use-job-live-stream";
import { useJobLogs } from "@/features/jobs/hooks/use-job-logs";
import { repoKeys } from "@/features/repo/query-keys";
import { JOB_STATUS, type RepositoryStatus } from "@repo/shared";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { ProcessingHeader } from "./processing-header";
import { TerminalConsole } from "./terminal-console";

interface ProcessingWorkspaceProps {
  repo: {
    id: string;
    latestJobId: string | null;
    status: RepositoryStatus;
  };
}

export function ProcessingWorkspace({ repo }: ProcessingWorkspaceProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const activeJobId = repo.latestJobId ?? "";

  const { data: jobData } = useJobLogs(activeJobId);
  const currentStatus = jobData?.status;

  const { liveMessages } = useJobLiveStream(
    activeJobId,
    repo.id,
    session?.accessToken
  );
  const [now, setNow] = useState(() => Date.now());

  const allTerminalMessages = useMemo(() => {
    const logsArray = jobData?.logs ?? [];
    const historicalMapped = logsArray.map((log) => ({
      message: log.message,
      timestamp: log.createdAt,
    }));

    const combined = [...historicalMapped, ...liveMessages];
    const seen = new Set<string>();

    return combined.filter((item) => {
      if (seen.has(item.message)) return false;
      seen.add(item.message);
      return true;
    });
  }, [jobData?.logs, liveMessages]);

  const lastLogAt = useMemo(() => {
    const last = allTerminalMessages.at(-1);
    if (!last) return null;
    return new Date(last.timestamp).getTime();
  }, [allTerminalMessages]);

  const secondsSinceLastLog = useMemo(() => {
    if (repo.status === "COMPLETED" || !lastLogAt) return 0;
    return Math.floor((now - lastLogAt) / 1000);
  }, [repo.status, lastLogAt, now]);

  useEffect(() => {
    if (repo.status !== "PROCESSING") return;

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [repo.status, activeJobId]);

  useEffect(() => {
    if (!currentStatus) return;

    const isTerminalState =
      currentStatus === JOB_STATUS.COMPLETED ||
      currentStatus === JOB_STATUS.FAILED ||
      currentStatus === JOB_STATUS.CANCELLED;

    if (isTerminalState) {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: repoKeys.detail(repo.id) }),
        queryClient.invalidateQueries({ queryKey: repoKeys.files(repo.id) }),
        queryClient.invalidateQueries({ queryKey: repoKeys.lists() }),
      ]);
    }
  }, [currentStatus, repo.id, queryClient]);

  const showBoostButton =
    repo.status === "PROCESSING" && secondsSinceLastLog >= 30;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ProcessingHeader
        showBoost={showBoostButton}
        isFailedState={repo.status === "FAILED"}
      />
      <main className="flex-1 overflow-y-auto h-full p-1 md:p-2 lg:p-4 animate-in fade-in duration-300">
        <TerminalConsole messages={allTerminalMessages} />
      </main>
    </div>
  );
}
