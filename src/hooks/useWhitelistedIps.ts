import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createWhitelistedIp,
  deleteWhitelistedIp,
  fetchWhitelistedIps,
} from '@/lib/api/whitelisted-ips';
import { queryKeys } from '@/lib/query-keys';
import { useAuth } from '@/hooks/useAuth';

export function useWhitelistedIps() {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.whitelistedIps.all,
    queryFn: fetchWhitelistedIps,
    enabled: Boolean(user?.onboarding_completed),
  });
}

export function useWhitelistedIpMutations() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.whitelistedIps.all });

  const create = useMutation({
    mutationFn: createWhitelistedIp,
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: deleteWhitelistedIp,
    onSuccess: invalidate,
  });

  return { create, remove };
}
