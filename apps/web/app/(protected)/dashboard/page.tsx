import { TodoListContainer } from "@/features/todo/components/todo-list-container";
import { fetchTodosQueryFn } from "@/features/todo/hooks/use-todos-query";
import { TODO_QUERY_KEYS } from "@/lib/react-query/query-keys";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import React from "react";

export const metadata = {
  title: "Dashboard",
  description:
    "Unified command terminal managing data pipelines and task targets.",
};
export const dynamic = "force-dynamic";

export default async function DashboardPage(): Promise<React.JSX.Element> {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: TODO_QUERY_KEYS.all,
      queryFn: fetchTodosQueryFn,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TodoListContainer />
    </HydrationBoundary>
  );
}
