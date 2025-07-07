"use client";

import { fetchAllUserRepository } from "@/lib/api";
import { Repository } from "@prisma/client";
import useSWR from "swr";
import SidebarRepoList from "./left-sidebar-repo-list";

interface LeftSidebarProps {
  initialRepositories: Repository[];
}

export function LeftSidebar({ initialRepositories }: LeftSidebarProps) {
  const { data: repositories } = useSWR<Repository[]>(fetchAllUserRepository, {
    fallbackData: initialRepositories,
  });

  return (
    <div className="w-full lg:fixed lg:inset-y-0 lg:left-0 lg:w-96 bg-background lg:border-r lg:border-dashed lg:pt-16">
      <div className="flex flex-col h-full my-4">
        {repositories && <SidebarRepoList repositories={repositories} />}
      </div>
    </div>
  );
}
