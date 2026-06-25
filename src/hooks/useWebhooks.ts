import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createWebhook,
  deleteWebhook,
  fetchWebhookDeliveries,
  fetchWebhooks,
  replayWebhookDelivery,
  rotateWebhookSecret,
  testWebhook,
  updateWebhook,
  type CreateWebhookPayload,
  type UpdateWebhookPayload,
} from '@/lib/api/webhooks';
import { queryKeys } from '@/lib/query-keys';
import { useAuth } from '@/hooks/useAuth';

export function useWebhooks() {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.webhooks.all,
    queryFn: fetchWebhooks,
    enabled: Boolean(user?.onboarding_completed),
  });
}

export function useWebhookDeliveries(webhookId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.webhooks.deliveries(webhookId),
    queryFn: () => fetchWebhookDeliveries(webhookId),
    enabled: Boolean(user?.onboarding_completed),
  });
}

export function useWebhookMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['webhooks'] });
  };

  const create = useMutation({
    mutationFn: (payload: CreateWebhookPayload) => createWebhook(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateWebhookPayload }) =>
      updateWebhook(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: deleteWebhook,
    onSuccess: invalidate,
  });

  const rotateSecret = useMutation({
    mutationFn: rotateWebhookSecret,
    onSuccess: invalidate,
  });

  const sendTest = useMutation({
    mutationFn: ({ id, event }: { id: string; event: string }) => testWebhook(id, event),
    onSuccess: invalidate,
  });

  const replay = useMutation({
    mutationFn: replayWebhookDelivery,
    onSuccess: invalidate,
  });

  return { create, update, remove, rotateSecret, sendTest, replay };
}
