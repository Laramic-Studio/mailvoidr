import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createApiKey,
  fetchApiKeys,
  revokeApiKey,
  rotateApiKey,
  type CreateApiKeyPayload,
} from '@/lib/api/api-keys';
import { queryKeys } from '@/lib/query-keys';
import { useAuth } from '@/hooks/useAuth';

export function useApiKeys() {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.apiKeys.all,
    queryFn: fetchApiKeys,
    enabled: Boolean(user?.onboarding_completed),
  });
}

export function useApiKeyMutations() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.all });

  const create = useMutation({
    mutationFn: (payload: CreateApiKeyPayload) => createApiKey(payload),
    onSuccess: invalidate,
  });

  const rotate = useMutation({
    mutationFn: rotateApiKey,
    onSuccess: invalidate,
  });

  const revoke = useMutation({
    mutationFn: revokeApiKey,
    onSuccess: invalidate,
  });

  return { create, rotate, revoke };
}
