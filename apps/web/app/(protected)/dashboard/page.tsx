import { RepoSubmissionPanel } from "@/features/repo/components/repo-submission-panel";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Dashboard Central - SummaryX Workspace",
  description:
    "Initialize predictive architectural maps, audit token tracking registries, and analyze git workspaces.",
};

export default function DashboardPage(): React.JSX.Element {
  return (
    <div className="flex-1 w-full h-full flex flex-col items-center justify-center py-12 md:py-20 lg:py-24">
      <RepoSubmissionPanel />
    </div>
  );
}
