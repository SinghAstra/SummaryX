import { createContext, useContext, useReducer } from "react";
import { initialState, repositoryReducer } from "./repository.reducer";
import { RepositoryAction, RepositoryState } from "./repository.types";

interface RepositoryContextType {
  state: RepositoryState;
  dispatch: React.Dispatch<RepositoryAction>;
}

const RepositoryContext = createContext<RepositoryContextType | undefined>(
  undefined
);

export function RepositoryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(repositoryReducer, initialState);

  return (
    <RepositoryContext.Provider value={{ state, dispatch }}>
      {children}
    </RepositoryContext.Provider>
  );
}

export function useRepository() {
  const context = useContext(RepositoryContext);
  if (context === undefined) {
    throw new Error("useRepository must be used within a RepositoryProvider");
  }
  return context;
}
