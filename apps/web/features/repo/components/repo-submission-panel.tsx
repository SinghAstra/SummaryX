"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { ingestRepoSchema, type IngestRepoInput } from "@repo/shared";
import { CornerDownLeft, GitBranch, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useIngestRepo } from "../hooks/use-ingest-repo";

export function RepoSubmissionPanel(): React.JSX.Element {
  const router = useRouter();
  const { mutateAsync: ingestRepo, isPending } = useIngestRepo();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IngestRepoInput>({
    resolver: zodResolver(ingestRepoSchema),
    defaultValues: { githubUrl: "" },
  });

  const onSubmit = async (values: IngestRepoInput): Promise<void> => {
    // Uses mutateAsync paired with a toast notification promise chain engine
    toast.promise(ingestRepo(values), {
      loading: "Cloning architecture mapping vectors...",
      success: (data) => {
        reset();
        router.push(`/repositories/${data.repositoryId}`);
        return data.isDuplicate
          ? "Workspace synchronized! Loading existing structural maps."
          : "Secure handshake complete! Background analytical engines running.";
      },
      error: (err: Error) =>
        err.message || "An unresolved network disruption occurred.",
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center text-center px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Visual Ambient Brand Accent */}
      <div className="mb-4 p-2 rounded-full bg-muted/60 border border-border/80 text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
        <Sparkles className="size-3.5 text-primary/80 animate-pulse" />
        <span>Ecosystem Blueprint Processing Engine v1.0</span>
      </div>

      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-3 max-w-xl">
        Where architectural analysis meets code comprehension.
      </h1>
      <p className="text-sm md:text-base text-muted-foreground mb-8 max-w-lg">
        Ingest public Git code configurations into atomic contextual maps
        instantly.
      </p>

      {/* Perplexity Console Field Container */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full relative bg-muted/40 hover:bg-muted/60 focus-within:bg-card focus-within:ring-1 focus-within:ring-ring border border-input rounded-xl p-2 transition-all duration-300 shadow-sm focus-within:shadow-md"
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Custom Input Layout Field Box */}
          <div className="relative flex-1 flex items-center">
            <GitBranch className="absolute left-3 size-4.5 text-muted-foreground/70 pointer-events-none" />
            <Input
              {...register("githubUrl")}
              type="text"
              placeholder="Paste a public GitHub repository link..."
              disabled={isPending}
              className="w-full pl-10 pr-4 py-6 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground/60 text-base rounded-none"
            />
          </div>

          {/* Fully Responsive Processing Button Trigger */}
          <div className="flex items-center justify-end px-1.5 sm:px-0">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto rounded-lg px-5 py-5 text-sm font-medium transition-transform active:scale-[0.98] select-none cursor-pointer flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Ingesting
                </>
              ) : (
                <>
                  Analyze Repository
                  <CornerDownLeft className="hidden sm:inline size-3 text-primary-foreground/80" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Floating Error Placement Component */}
        {errors.githubUrl && (
          <div className="absolute left-2 -bottom-7 bg-background text-destructive text-xs font-medium px-2 py-0.5 rounded border border-destructive/20 shadow-sm animate-in fade-in duration-200">
            {errors.githubUrl.message}
          </div>
        )}
      </form>

      {/* Suggestion Quicklinks Footer Line */}
      <div className="mt-12 text-xs text-muted-foreground/50 flex flex-wrap items-center justify-center gap-2 max-w-md select-none">
        <span>Try parsing public libraries:</span>
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            // Quick-populate handler helper
            toast.info(
              "Link template selected! Review signature context before analyzing."
            );
          }}
          className="px-2 py-1 rounded bg-muted/50 border border-border/40 hover:border-border hover:bg-muted/80 text-muted-foreground/80 hover:text-foreground font-mono transition-all text-[10px] cursor-pointer"
        >
          facebook/react
        </button>
      </div>
    </div>
  );
}
