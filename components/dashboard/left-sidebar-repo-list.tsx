import React from "react";
import { useRepository } from "../context/repository";
import EmptyRepositoriesSidebarRepoList from "./empty/sidebar-repo-list";
import { RepositoryCard } from "./left-sidebar-repository-card";

const SidebarRepoList = () => {
  const { state } = useRepository();
  if (!state.userRepositories || state.userRepositories.length === 0) {
    return <EmptyRepositoriesSidebarRepoList />;
  }
  return (
    <div className="h-full overflow-y-auto px-4 ">
      <div className="flex flex-col gap-4 ">
        {state.userRepositories.map((repo) => {
          return <RepositoryCard key={repo.id} repository={repo} />;
        })}
      </div>
    </div>
  );
};

export default SidebarRepoList;
