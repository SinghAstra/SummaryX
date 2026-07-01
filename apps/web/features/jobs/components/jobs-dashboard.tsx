"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Play, Server, Terminal } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useCreateJob } from "../hooks/use-create-job";
import { useJobs } from "../hooks/use-jobs";

export function JobsDashboard() {
  const { data: jobs = [] } = useJobs();
  const { mutateAsync: createJob, isPending } = useCreateJob();

  const handleLaunchPipeline = async () => {
    toast.promise(createJob(), {
      loading: "Allocating analysis worker pipeline...",
      success: "Worker launched successfully!",
      error: (err) => err.message,
    });
  };

  return (
    <div className="w-full mx-auto max-w-2xl space-y-8 animate-in fade-in duration-300 flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <Button
          onClick={handleLaunchPipeline}
          disabled={isPending}
          className="flex items-center justify-center gap-2 disabled:opacity-40 shadow-sm shrink-0"
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
          <span>Launch Analysis Worker</span>
        </Button>
      </div>

      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 select-none">
          <Terminal className="w-3.5 h-3.5" />
          <span>Execution Run History ({jobs.length})</span>
        </h2>

        {jobs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-xs text-muted-foreground bg-muted/20">
            No active or historical worker allocations discovered on this
            profile line.
          </div>
        ) : (
          <div className="grid gap-2.5">
            {jobs.map((job) => (
              <div key={job.id}>
                <Link href={`/jobs/${job.id}`}>
                  <div className="group flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-muted/40 transition-all duration-150 active:scale-[0.995]">
                    <div className="flex items-center gap-3 min-w-0">
                      <Server className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                      <div className="font-mono text-xs truncate max-w-xs select-all">
                        ID: {job.id}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 font-mono text-3xs">
                      <div className="px-2 py-0.5 rounded-md border tracking-wide ">
                        {job.status}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
