import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  enableLiveSending,
  fetchCreditTransactions,
  fetchCredits,
} from '@/lib/api/credits';
import { queryKeys } from '@/lib/query-keys';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspaceStore } from '@/stores/workspace-store';

export function useCredits() {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.credits.summary,
    queryFn: fetchCredits,
    enabled: Boolean(user?.onboarding_completed),
  });
}

export function useCreditTransactions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.credits.transactions,
    queryFn: fetchCreditTransactions,
    enabled: Boolean(user?.onboarding_completed),
  });
}

export function useCreditMutations() {
  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceStore((s) => s.selectedWorkspaceId);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.credits.summary });
    queryClient.invalidateQueries({ queryKey: queryKeys.credits.transactions });
    queryClient.invalidateQueries({ queryKey: queryKeys.billing.context(workspaceId ?? undefined) });
    queryClient.invalidateQueries({ queryKey: queryKeys.smtpCredentials.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.send.history });
  };

  const enableSending = useMutation({
    mutationFn: enableLiveSending,
    onSuccess: invalidate,
  });

  return { enableSending };
}
