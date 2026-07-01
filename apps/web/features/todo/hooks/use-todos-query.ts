import { TODO_QUERY_KEYS } from "@/lib/react-query/query-keys";
import { useQuery } from "@tanstack/react-query";
import { getTodosAction } from "../actions/get-todos-action";

export async function fetchTodosQueryFn() {
  const response = await getTodosAction();
  if (!response.success) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export function useTodosQuery() {
  return useQuery({
    queryKey: TODO_QUERY_KEYS.all,
    queryFn: fetchTodosQueryFn,
  });
}
