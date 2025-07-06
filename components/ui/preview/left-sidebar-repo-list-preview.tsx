"use client";

import { RepositoryPreview } from "@/interfaces/github";
import { containerVariant } from "@/lib/variants";
import { motion } from "framer-motion";
import React from "react";
import { SidebarRepositoryCardPreview } from "./left-sidebar-repository-card-preview";

const LeftSidebarRepoListPreview = ({
  previewRepos,
}: {
  previewRepos: RepositoryPreview[];
}) => {
  return (
    <div className="w-full lg:w-96 bg-background lg:border-r lg:border-dashed ">
      <motion.div
        variants={containerVariant}
        initial="hidden"
        whileInView="visible"
        className="flex flex-col gap-4 h-full px-2 py-3  "
      >
        {previewRepos.map((repo) => {
          return (
            <SidebarRepositoryCardPreview
              key={repo.avatarUrl}
              repository={repo}
            />
          );
        })}
      </motion.div>
    </div>
  );
};

export default LeftSidebarRepoListPreview;
