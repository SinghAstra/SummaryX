"use client";

import { Button } from "@/components/ui/button";
import { type RepositoryStatus } from "@repo/shared";
import { AlertTriangle, ArrowLeft, Clock, Loader2, Server } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface TerminalHeaderProps {
  readonly jobId: string;
  readonly status: RepositoryStatus;
  readonly onBackClick?: () => void;
}

// 🎨 Fully Semantic Config Map: Zero hardcoded colors, perfect theme-aware components
const statusConfig = {
  PENDING: {
    label: "Pending",
    classes: "bg-muted text-muted-foreground border-border/80",
    icon: <Clock className="w-3 h-3 shrink-0" />,
  },
  PROCESSING: {
    label: "Processing",
    classes: "bg-primary/10 text-primary border-primary/20 animate-pulse",
    icon: <Loader2 className="w-3 h-3 shrink-0 animate-spin" />,
  },
  FAILED: {
    label: "Failed",
    classes: "bg-destructive/10 text-destructive border-destructive/20",
    icon: <AlertTriangle className="w-3 h-3 shrink-0" />,
  },
} as const;

export function TerminalHeader({
  jobId,
  status,
  onBackClick,
}: TerminalHeaderProps): React.JSX.Element {
  const router = useRouter();

  // Resolve current visual state configuration safely, falling back to a clean default state
  const config =
    statusConfig[status as keyof typeof statusConfig] ?? statusConfig.PENDING;

  const handleNavigationBack = (): void => {
    if (onBackClick) {
      onBackClick();
      return;
    }
    router.push("/dashboard"); // Safe systemic fallback route
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none w-full border-b border-border/40 pb-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleNavigationBack}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer self-start sm:self-auto"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to dashboard</span>
      </Button>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        {/* 🟢 System Action Badge */}
        <div
          className={`flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded border shadow-sm ${config.classes}`}
        >
          {config.icon}
          <span>{config.label}</span>
        </div>

        {/* 📟 Instance Context Container */}
        <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground bg-muted/40 px-2.5 py-1 rounded border border-border/60 max-w-xs overflow-hidden">
          <Server className="w-3 h-3 shrink-0" />
          <span className="truncate select-all">
            JOB: {jobId || "unassigned"}
          </span>
        </div>
      </div>
    </div>
  );
}
