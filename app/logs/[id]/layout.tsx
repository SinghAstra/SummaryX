import { Navbar } from "@/components/dashboard/navbar";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

interface RepositoryLogsLayoutProps {
  children: ReactNode;
  params: { id: string };
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/sign-in");
  }

  const repositoryId = params.id;

  const repository = await prisma.repository.findUnique({
    where: { id: repositoryId },
  });

  if (!repository) {
    return {
      title: "Repository Not Found",
      description: "The requested repository could not be found",
    };
  }

  return {
    title: `Logs - ${repository.name}`,
    description: `Processing logs for ${repository.owner}/${repository.name} repository`,
  };
}

export default async function RepositoryLogsLayout({
  children,
}: RepositoryLogsLayoutProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/sign-in");
  }
  return (
    <div className="flex flex-col ">
      <Navbar user={session.user} />
      <div className="pt-20">{children}</div>
    </div>
  );
}
