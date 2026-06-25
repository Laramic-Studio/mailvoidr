import { useQuery } from "@tanstack/react-query";
import { checkHealth } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: checkHealth,
    retry: 1,
    staleTime: 30_000,
  });
}
