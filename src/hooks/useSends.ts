import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchSendDetail, fetchSends, retrySend } from '@/lib/api/sends';
import { queryKeys } from '@/lib/query-keys';
import { useAuth } from '@/hooks/useAuth';
import type { SendLogFilters } from '@/types';

export function useSends(filters: SendLogFilters) {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.sends.list(filters),
    queryFn: () => fetchSends(filters),
    enabled: Boolean(user?.onboarding_completed),
  });
}

export function useSendDetail(id: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.sends.detail(id ?? ''),
    queryFn: () => fetchSendDetail(id!),
    enabled: Boolean(user?.onboarding_completed && id),
  });
}

export function useSendLogMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['sends'] });
    queryClient.invalidateQueries({ queryKey: queryKeys.send.history });
  };

  const retry = useMutation({
    mutationFn: retrySend,
    onSuccess: invalidate,
  });

  return { retry };
}
