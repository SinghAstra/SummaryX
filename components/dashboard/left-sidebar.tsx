"use client";

import { Repository } from "@prisma/client";
import { useEffect } from "react";
import { setUserRepositories, useRepository } from "../context/repository";
import SidebarRepoHeader from "./left-sidebar-repo-header";
import SidebarRepoList from "./left-sidebar-repo-list";

interface LeftSidebarProps {
  repositories: Repository[];
}

export function LeftSidebar({ repositories }: LeftSidebarProps) {
  const { state, dispatch } = useRepository();

  useEffect(() => {
    if (repositories && state.userRepositories.length === 0) {
      dispatch(setUserRepositories(repositories));
    }
  }, [dispatch, repositories, state.userRepositories.length]);

  return (
    <div className="w-full md:fixed md:inset-y-0 md:left-0 md:w-96 bg-background md:border-r md:border-dashed md:pt-16">
      <div className="flex flex-col h-full">
        <SidebarRepoHeader />
        <div className="flex-1 overflow-hidden ">
          <SidebarRepoList />
        </div>
      </div>
    </div>
  );
}
