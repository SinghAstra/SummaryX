import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { getRepositoryData } from "./action";
import RepoExplorer from "./repo-explorer";

type RepositoryLayoutProps = {
  params: { id: string };
};

export default async function RepositoryPage({
  params,
}: RepositoryLayoutProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/sign-in");
  }

  const repository = await getRepositoryData(params.id);
  if (!repository) {
    notFound();
  }

  if (repository.status === "PENDING" || repository.status === "PROCESSING") {
    redirect(`/logs/${repository.id}`);
  }

  if (repository.status === "FAILED") {
    redirect("/dashboard");
  }

  return <RepoExplorer repository={repository} user={session.user} />;
}
