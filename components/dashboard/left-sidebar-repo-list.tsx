"use client";

import { containerVariant } from "@/lib/variants";
import { Repository } from "@prisma/client";
import { motion } from "framer-motion";
import React from "react";
import EmptyRepositoriesSidebarRepoList from "./empty/sidebar-repo-list";
import { RepositoryCard } from "./left-sidebar-repository-card";

interface SidebarRepoListProps {
  repositories: Repository[];
}

const SidebarRepoList = ({ repositories }: SidebarRepoListProps) => {
  if (repositories.length === 0) {
    return <EmptyRepositoriesSidebarRepoList />;
  }
  return (
    <div className="h-full overflow-y-auto px-4 ">
      <motion.div
        variants={containerVariant}
        initial="hidden"
        whileInView="visible"
        className="flex flex-col gap-4 "
      >
        {repositories.map((repo) => {
          return <RepositoryCard key={repo.id} repository={repo} />;
        })}
      </motion.div>
    </div>
  );
};

export default SidebarRepoList;
