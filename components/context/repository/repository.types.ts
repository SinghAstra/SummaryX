import { Repository } from "@prisma/client";

export interface RepositoryState {
  userRepositories: Repository[];
}
export type RepositoryAction =
  | {
      type: "SET_USER_REPOSITORIES";
      payload: Repository[];
    }
  | {
      type: "ADD_USER_REPOSITORY";
      payload: Repository;
    };
