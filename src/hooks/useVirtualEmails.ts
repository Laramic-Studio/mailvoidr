import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createVirtualEmail,
  deleteVirtualEmail,
  deleteVirtualEmailMessage,
  fetchVirtualEmail,
  fetchVirtualEmailMessage,
  fetchVirtualEmailMessageRaw,
  fetchVirtualEmailMessages,
  fetchVirtualEmails,
  type CreateVirtualEmailPayload,
} from '@/lib/api/virtual-emails';
import { queryKeys } from '@/lib/query-keys';
import { useAuth } from '@/hooks/useAuth';

export function useVirtualEmails(search?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.virtualEmails.all(search),
    queryFn: () => fetchVirtualEmails(search),
    enabled: Boolean(user?.onboarding_completed),
  });
}

export function useVirtualEmail(inboxId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.virtualEmails.detail(inboxId ?? ''),
    queryFn: () => fetchVirtualEmail(inboxId!),
    enabled: Boolean(user?.onboarding_completed && inboxId),
  });
}

export function useVirtualEmailMessages(inboxId: string | undefined, search?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.virtualEmails.messages(inboxId ?? '', search),
    queryFn: () => fetchVirtualEmailMessages(inboxId!, search),
    enabled: Boolean(user?.onboarding_completed && inboxId),
  });
}

export function useVirtualEmailMessage(
  inboxId: string | undefined,
  messageId: string | undefined,
) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.virtualEmails.message(inboxId ?? '', messageId ?? ''),
    queryFn: async () => {
      const result = await fetchVirtualEmailMessage(inboxId!, messageId!);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.virtualEmails.messages(inboxId!),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.virtualEmails.detail(inboxId!),
      });
      return result.message;
    },
    enabled: Boolean(user?.onboarding_completed && inboxId && messageId),
  });
}

export function useVirtualEmailMessageRaw(
  inboxId: string | undefined,
  messageId: string | undefined,
  enabled: boolean,
) {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.virtualEmails.messageRaw(inboxId ?? '', messageId ?? ''),
    queryFn: () => fetchVirtualEmailMessageRaw(inboxId!, messageId!),
    enabled: Boolean(user?.onboarding_completed && inboxId && messageId && enabled),
  });
}

export function useVirtualEmailMutations(search?: string) {
  const queryClient = useQueryClient();

  const invalidateList = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.virtualEmails.all(search) });

  const create = useMutation({
    mutationFn: (payload: CreateVirtualEmailPayload) => createVirtualEmail(payload),
    onSuccess: invalidateList,
  });

  const remove = useMutation({
    mutationFn: deleteVirtualEmail,
    onSuccess: invalidateList,
  });

  return { create, remove };
}

export function useVirtualEmailMessageMutations(inboxId: string) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.virtualEmails.messages(inboxId),
    });
    void queryClient.invalidateQueries({
      queryKey: queryKeys.virtualEmails.detail(inboxId),
    });
  };

  const remove = useMutation({
    mutationFn: (messageId: string) => deleteVirtualEmailMessage(inboxId, messageId),
    onSuccess: invalidate,
  });

  return { remove };
}
