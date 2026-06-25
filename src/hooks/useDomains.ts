import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createDomain,
  deleteDomain,
  fetchDomains,
  verifyDomain,
} from '@/lib/api/domains';
import { queryKeys } from '@/lib/query-keys';
import { useAuth } from '@/hooks/useAuth';

export function useDomains() {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.domains.all,
    queryFn: fetchDomains,
    enabled: Boolean(user?.onboarding_completed),
  });
}

export function useDomainMutations() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.domains.all });

  const create = useMutation({
    mutationFn: (domain: string) => createDomain(domain),
    onSuccess: invalidate,
  });

  const verify = useMutation({
    mutationFn: verifyDomain,
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: deleteDomain,
    onSuccess: invalidate,
  });

  return { create, verify, remove };
}
