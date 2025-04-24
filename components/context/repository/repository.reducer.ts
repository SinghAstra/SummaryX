import { RepositoryAction, RepositoryState } from "./repository.types";

export const initialState: RepositoryState = {
  userRepositories: [],
};

export function repositoryReducer(
  state: RepositoryState,
  action: RepositoryAction
): RepositoryState {
  switch (action.type) {
    case "SET_USER_REPOSITORIES":
      return {
        ...state,
        userRepositories: [...action.payload],
      };
    case "ADD_USER_REPOSITORY":
      return {
        ...state,
        userRepositories: [action.payload, ...state.userRepositories],
      };
    default:
      return state;
  }
}
