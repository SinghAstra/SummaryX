import { RepositoryPreview } from "@/interfaces/github";
import React from "react";
import { fetchTrendingTypeScriptRepos } from "./action";
import LandingPage from "./landing";

const HomePage = async () => {
  const trendingRepos = await fetchTrendingTypeScriptRepos();
  const parsedTrendingRepos: RepositoryPreview[] = trendingRepos.map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (repo: any) => {
      return {
        name: repo.name,
        owner: repo.owner.login,
        avatarUrl: repo.owner.avatar_url,
      };
    }
  );
  return <LandingPage previewRepos={parsedTrendingRepos} />;
};

export default HomePage;
