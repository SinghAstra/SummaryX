"use client";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { TerminalHeader } from "../../files/components/terminal-header";
import { useJobLiveStream } from "../hooks/use-job-live-stream";
import { useJobLogs } from "../hooks/use-job-logs";
import { TerminalConsole } from "./terminal-console";

interface HistoricLogEntry {
  id: string;
  message: string;
  level: string;
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const session = useSession();
  const jobId = params.id as string;

  const { data: initialLogs = [] } = useJobLogs(jobId);
  const { liveMessages } = useJobLiveStream(jobId, session.data?.accessToken);

  const allMessages = useMemo(() => {
    const historical = initialLogs.map((log: HistoricLogEntry) => log.message);
    return [...historical, ...liveMessages];
  }, [initialLogs, liveMessages]);

  return (
    <div className="w-full max-w-2xl space-y-4 m-auto flex flex-col">
      <TerminalHeader jobId={jobId} onBackClick={() => router.push("/jobs")} />
      <TerminalConsole messages={allMessages} />
    </div>
  );
}
