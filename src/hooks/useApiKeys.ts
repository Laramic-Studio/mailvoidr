import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createApiKey,
  fetchApiKeys,
  revealApiKey,
  revokeApiKey,
  rotateApiKey,
  type CreateApiKeyPayload,
} from '@/lib/api/api-keys';
import type { ApiKeyEnvironment } from '@/constants/api-keys';
import { queryKeys } from '@/lib/query-keys';
import { useAuth } from '@/hooks/useAuth';

export function useApiKeys(environment: ApiKeyEnvironment) {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.apiKeys.list(environment),
    queryFn: () => fetchApiKeys(environment),
    enabled: Boolean(user?.onboarding_completed),
  });
}

export function useApiKeyMutations(environment: ApiKeyEnvironment) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.list(environment) });
    queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.all });
  };

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

  const reveal = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      revealApiKey(id, password),
  });

  return { create, rotate, revoke, reveal };
}
