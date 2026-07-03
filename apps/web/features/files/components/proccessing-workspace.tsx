"use client";

import { TerminalHeader } from "@/features/files/components/terminal-header";
import { TerminalConsole } from "@/features/jobs/components/terminal-console";
import { useJobLiveStream } from "@/features/jobs/hooks/use-job-live-stream";
import { useJobLogs } from "@/features/jobs/hooks/use-job-logs";
import { RepositoryStatus } from "@repo/shared";
import { useSession } from "next-auth/react";
import { useMemo } from "react";

interface ProcessingWorkspaceProps {
  repo: {
    latestJobId: string | null;
    status: RepositoryStatus;
  };
}

export function ProcessingWorkspace({ repo }: ProcessingWorkspaceProps) {
  const { data: session } = useSession();
  const activeJobId = repo.latestJobId ?? "";
  const { data: initialLogs = [] } = useJobLogs(activeJobId);
  const { liveMessages } = useJobLiveStream(activeJobId, session?.accessToken);

  const allTerminalMessages = useMemo(() => {
    return [...initialLogs.map((log) => log.message), ...liveMessages];
  }, [initialLogs, liveMessages]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full w-full">
      <div className="w-full max-w-3xl space-y-4 m-auto p-4 flex flex-col">
        <TerminalHeader jobId={activeJobId} status={repo.status} />
        <TerminalConsole messages={allTerminalMessages} />
      </div>
    </div>
  );
}
