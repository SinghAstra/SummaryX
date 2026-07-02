import { buildFileTree } from "@/features/repo/utils/tree-builder";
import { ArrowLeft, FolderTree, HardDrive } from "lucide-react";
import { type Metadata } from "next";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "Repository Explorer - SummaryX",
  description:
    "Navigate code architecture structures and view file index logs.",
};

interface RepositoryPageProps {
  readonly params: Promise<{ id: string }>;
}

const MOCK_FILES_PAYLOAD = [
  {
    relativePath: "src/index.ts",
    extension: ".ts",
    size: 1240,
    summaryStatus: "COMPLETED",
  },
  {
    relativePath: "src/components/button.tsx",
    extension: ".tsx",
    size: 3420,
    summaryStatus: "COMPLETED",
  },
  {
    relativePath: "src/components/input.tsx",
    extension: ".tsx",
    size: 2150,
    summaryStatus: "PENDING",
  },
  {
    relativePath: "packages/shared/package.json",
    extension: ".json",
    size: 480,
    summaryStatus: "COMPLETED",
  },
  { relativePath: "config/empty-dir", relativePath_stub: true }, // Verified empty-node block target
];

export default async function RepositoryExplorerPage({
  params,
}: RepositoryPageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  const cleanFilesList = MOCK_FILES_PAYLOAD.filter((f) => !f.relativePath_stub);
  const fileTreeStructure = buildFileTree(cleanFilesList);

  return (
    <div className="w-full flex-1 flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Navigation Return Utility Bar */}
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-lg border border-border/80 bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Codebase Explorer
            </h1>
            <p className="text-xs text-muted-foreground font-mono truncate max-w-60 sm:max-w-md">
              Snapshot Ref: {id}
            </p>
          </div>
        </div>
      </div>

      {/* Main Double Split Grid Frame */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-start">
        {/* Left Hand Folder Directory Canvas block */}
        <div className="lg:col-span-1 border border-border bg-card/40 rounded-xl p-4 shadow-sm h-150 overflow-y-auto flex flex-col">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 border-b border-border/40 pb-2 select-none">
            <FolderTree className="size-3.5" />
            <span>Directory Topology</span>
          </div>

          <div className="flex-1">
            <FileTree
              nodes={fileTreeStructure}
              onFileSelect={(path) =>
                console.log(`Target item selected: ${path}`)
              }
            />
          </div>
        </div>

        {/* Right Hand Context Detail Display Block */}
        <div className="lg:col-span-2 border border-border bg-muted/20 border-dashed rounded-xl p-8 h-[600px] flex flex-col items-center justify-center text-center select-none">
          <HardDrive className="size-8 text-muted-foreground/40 mb-3 stroke-[1.5]" />
          <h3 className="text-sm font-semibold text-foreground/80 mb-1">
            No file context loaded
          </h3>
          <p className="text-xs text-muted-foreground max-w-xs">
            Select an indexed file element from the layout canvas matrix tree to
            review background summaries.
          </p>
        </div>
      </div>
    </div>
  );
}
