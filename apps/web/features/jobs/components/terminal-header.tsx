"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Server } from "lucide-react";

interface TerminalHeaderProps {
  jobId: string;
  onBackClick: () => void;
}

export function TerminalHeader({ jobId, onBackClick }: TerminalHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 select-none w-full">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBackClick}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to terminal list</span>
      </Button>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground bg-muted/60 px-2.5 py-1.5 rounded border border-border/60 overflow-hidden">
          <Server className="w-3 h-3 shrink-0" />
          <span className="truncate max-w-xs select-all">JOB: {jobId}</span>
        </div>
      </div>
    </div>
  );
}
