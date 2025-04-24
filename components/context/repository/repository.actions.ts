import { Repository } from "@prisma/client";
import { RepositoryAction } from "./repository.types";

export const setUserRepositories = (
  repositories: Repository[]
): RepositoryAction => ({
  type: "SET_USER_REPOSITORIES",
  payload: repositories,
});

export const addUserRepository = (
  repository: Repository
): RepositoryAction => ({
  type: "ADD_USER_REPOSITORY",
  payload: repository,
});

