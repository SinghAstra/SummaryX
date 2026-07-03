"use client";

import { TerminalConsole } from "@/features/jobs/components/terminal-console";
import { useJobLiveStream } from "@/features/jobs/hooks/use-job-live-stream";
import { useJobLogs } from "@/features/jobs/hooks/use-job-logs";
import { RepositoryStatus } from "@repo/shared";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { ProcessingHeader } from "./processing-header";

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
    <div className="flex-1 flex flex-col overflow-hidden">
      <ProcessingHeader />

      <main className="flex-1 overflow-y-auto h-full p-1 md:p-2 lg:p-4 animate-in fade-in duration-300">
        <TerminalConsole messages={allTerminalMessages} />
      </main>
    </div>
  );
}
