"use client";

import { useJobLiveStream } from "@/features/jobs/hooks/use-job-live-stream";
import { useJobLogs } from "@/features/jobs/hooks/use-job-logs";
import { type RepositoryStatus } from "@repo/shared";
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
  const activeJobId = repo.latestJobId ?? "";

  const { data: jobData } = useJobLogs(activeJobId);
  const { liveMessages } = useJobLiveStream(
    activeJobId,
    repo.id,
    session?.accessToken
  );

  const [showBoostButton, setShowBoostButton] = useState(false);

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

  useEffect(() => {
    const resetTimer = setTimeout(() => {
      setShowBoostButton((prev) => (prev ? false : prev));
    }, 0);

    if (repo.status !== "PROCESSING") {
      return () => clearTimeout(resetTimer);
    }

    const stallTimer = setTimeout(() => {
      setShowBoostButton(true);
    }, 30000);

    return () => {
      clearTimeout(resetTimer);
      clearTimeout(stallTimer);
    };
  }, [repo.status, allTerminalMessages.length]);

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
