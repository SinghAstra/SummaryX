import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import RepoLogs from "./repo-logs";

export default async function RepoProcessingLogsPage({
  params,
}: {
  params: { id: string };
}) {
  const repositoryId = params.id;

  const repository = await prisma.repository.findUnique({
    where: { id: repositoryId },
    include: { logs: true },
  });

  if (!repository) {
    notFound();
  }

  if (repository.status === "SUCCESS") {
    redirect(`/repository/${repositoryId}`);
  }
  if (repository.status === "FAILED") {
    notFound();
  }

  return <RepoLogs repository={repository} />;
}
