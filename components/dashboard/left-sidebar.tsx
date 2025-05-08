"use client";

import { fetchAllUserRepository } from "@/lib/api";
import { Repository } from "@prisma/client";
import useSWR from "swr";
import SidebarRepoHeader from "./left-sidebar-repo-header";
import SidebarRepoList from "./left-sidebar-repo-list";

interface LeftSidebarProps {
  initialRepositories: Repository[];
}

export function LeftSidebar({ initialRepositories }: LeftSidebarProps) {
  const { data: repositories } = useSWR<Repository[]>(fetchAllUserRepository, {
    fallbackData: initialRepositories,
  });

  return (
    <div className="w-full md:fixed md:inset-y-0 md:left-0 md:w-96 bg-background md:border-r md:border-dashed md:pt-16">
      <div className="flex flex-col h-full">
        <SidebarRepoHeader />
        <div className="flex-1 overflow-hidden ">
          {repositories && <SidebarRepoList repositories={repositories} />}
        </div>
      </div>
    </div>
  );
}
