import { ReactNode } from "react";
import { getRepositoryData } from "./action";

type RepositoryLayoutProps = {
  children: ReactNode;
  params: { id: string };
};

export async function generateMetadata({ params }: { params: { id: string } }) {
  const repository = await getRepositoryData(params.id);

  if (!repository) {
    return {
      title: "Repository Not Found",
    };
  }

  return {
    title: `${repository.name} | Repository Explorer`,
    description: `View details for ${repository.owner}/${repository.name}`,
  };
}

export default async function RepositoryLayout({
  children,
}: RepositoryLayoutProps) {
  return children;
}
