import { type Query, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import type { EmailMessageListResponse, VirtualEmailListResponse } from '@/types';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isVirtualEmailListQuery(query: Query): boolean {
  const key = query.queryKey;
  return key.length === 2 && key[0] === 'virtual-emails' && !UUID_RE.test(String(key[1]));
}

function virtualEmailMatchesSearch(
  item: VirtualEmailListResponse['data'][number],
  searchTerm: string,
): boolean {
  if (!searchTerm) return true;

  const haystack = `${item.email_address} ${item.label ?? ''}`.toLowerCase();
  return haystack.includes(searchTerm.toLowerCase());
}

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

export function useVirtualEmailMutations() {
  const queryClient = useQueryClient();

  const invalidateLists = () =>
    void queryClient.invalidateQueries({ predicate: isVirtualEmailListQuery });

  const create = useMutation({
    mutationFn: (payload: CreateVirtualEmailPayload) => createVirtualEmail(payload),
    onSuccess: (result) => {
      queryClient.setQueriesData<VirtualEmailListResponse>(
        { predicate: isVirtualEmailListQuery },
        (old, query) => {
          const searchTerm = String(query.queryKey[1] ?? '');
          const item = result.virtual_email;

          if (!virtualEmailMatchesSearch(item, searchTerm)) {
            return old;
          }

          if (!old) {
            return {
              data: [item],
              meta: { current_page: 1, last_page: 1, per_page: 50, total: 1 },
            };
          }

          if (old.data.some((entry) => entry.id === item.id)) {
            return old;
          }

          return {
            ...old,
            data: [item, ...old.data],
            meta: { ...old.meta, total: old.meta.total + 1 },
          };
        },
      );
      invalidateLists();
    },
  });

  const remove = useMutation({
    mutationFn: deleteVirtualEmail,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ predicate: isVirtualEmailListQuery });

      const snapshots = queryClient.getQueriesData<VirtualEmailListResponse>({
        predicate: isVirtualEmailListQuery,
      });

      queryClient.setQueriesData<VirtualEmailListResponse>(
        { predicate: isVirtualEmailListQuery },
        (old) => {
          if (!old) return old;

          return {
            ...old,
            data: old.data.filter((item) => item.id !== id),
            meta: { ...old.meta, total: Math.max(0, old.meta.total - 1) },
          };
        },
      );

      return { snapshots };
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.virtualEmails.detail(id) });
      invalidateLists();
    },
    onError: (_error, _id, context) => {
      context?.snapshots.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
  });

  return { create, remove };
}

export function useVirtualEmailMessageMutations(inboxId: string) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: ['virtual-emails', inboxId, 'messages'],
    });
    void queryClient.invalidateQueries({
      queryKey: queryKeys.virtualEmails.detail(inboxId),
    });
  };

  const remove = useMutation({
    mutationFn: (messageId: string) => deleteVirtualEmailMessage(inboxId, messageId),
    onMutate: async (messageId) => {
      await queryClient.cancelQueries({ queryKey: ['virtual-emails', inboxId, 'messages'] });

      queryClient.setQueriesData<EmailMessageListResponse>(
        { queryKey: ['virtual-emails', inboxId, 'messages'] },
        (old) => {
          if (!old) return old;
          return { ...old, data: old.data.filter((m) => m.id !== messageId) };
        },
      );
    },
    onSuccess: (_, messageId) => {
      queryClient.removeQueries({
        queryKey: queryKeys.virtualEmails.message(inboxId, messageId),
      });
      queryClient.removeQueries({
        queryKey: queryKeys.virtualEmails.messageRaw(inboxId, messageId),
      });
      invalidate();
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: ['virtual-emails', inboxId, 'messages'] });
    },
  });

  return { remove };
}
