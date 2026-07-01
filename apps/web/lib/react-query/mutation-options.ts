import { type QueryClient } from "@tanstack/react-query";

interface InvalidationConfig {
  readonly queryClient: QueryClient;
  readonly queryKey: readonly unknown[];
}

export const mutationOptions = {
  handleInvalidation: ({ queryClient, queryKey }: InvalidationConfig) => {
    return {
      onSuccess: async (): Promise<void> => {
        await queryClient.invalidateQueries({ queryKey });
      },
    };
  },
};
