import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  confirmBillingCheckout,
  fetchBilling,
  startBillingCheckout,
} from '@/lib/api/billing';
import { queryKeys } from '@/lib/query-keys';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspaceStore } from '@/stores/workspace-store';

export function useBilling() {
  const { user } = useAuth();
  const workspaceId = useWorkspaceStore((s) => s.selectedWorkspaceId);

  return useQuery({
    queryKey: queryKeys.billing.context(workspaceId ?? undefined),
    queryFn: fetchBilling,
    enabled: Boolean(user?.onboarding_completed),
  });
}

export function useBillingMutations() {
  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceStore((s) => s.selectedWorkspaceId);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.billing.context(workspaceId ?? undefined) });
    queryClient.invalidateQueries({ queryKey: queryKeys.credits.summary });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview('30d') });
  };

  const checkout = useMutation({
    mutationFn: startBillingCheckout,
  });

  const confirmCheckout = useMutation({
    mutationFn: confirmBillingCheckout,
    onSuccess: invalidate,
  });

  return { checkout, confirmCheckout };
}
