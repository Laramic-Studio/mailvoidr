import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  clearSandboxMessages,
  enableSandbox,
  fetchSandbox,
  fetchSandboxMessage,
  fetchSandboxMessageRaw,
  fetchSandboxMessages,
  markAllSandboxMessagesRead,
  type SandboxMessageFilters,
} from '@/lib/api/sandbox';
import { queryKeys } from '@/lib/query-keys';
import { useAuth } from '@/hooks/useAuth';
import type { EmailMessageListResponse, SandboxResponse } from '@/types';

function isSandboxListQueryKey(key: readonly unknown[]): boolean {
  return (
    key.length === 4 &&
    key[0] === 'sandbox' &&
    key[1] === 'messages' &&
    (key[3] === 'unread' || key[3] === 'all')
  );
}

function patchSandboxUnreadCount(
  queryClient: ReturnType<typeof useQueryClient>,
  delta: number,
) {
  queryClient.setQueryData<SandboxResponse>(queryKeys.sandbox.all, (old) => {
    if (!old?.inbox) return old;
    return {
      ...old,
      inbox: {
        ...old.inbox,
        unread_count: Math.max(0, old.inbox.unread_count + delta),
      },
    };
  });
}

function markMessageReadInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  messageId: string,
) {
  let wasUnread = false;

  queryClient.setQueriesData<EmailMessageListResponse>(
    {
      predicate: (query) => isSandboxListQueryKey(query.queryKey),
    },
    (old) => {
      if (!old) return old;

      return {
        ...old,
        data: old.data.map((item) => {
          if (item.id !== messageId) return item;
          if (!item.is_read) wasUnread = true;
          return { ...item, is_read: true };
        }),
      };
    },
  );

  if (wasUnread) {
    patchSandboxUnreadCount(queryClient, -1);
  }
}

export function useSandbox() {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.sandbox.all,
    queryFn: fetchSandbox,
    enabled: Boolean(user?.onboarding_completed),
    staleTime: 60_000,
  });
}

export function useSandboxMessages(
  filters: SandboxMessageFilters = {},
  inboxEnabled = true,
) {
  const { user } = useAuth();
  const search = filters.search?.trim() || undefined;
  const unreadOnly = Boolean(filters.unread);

  return useQuery({
    queryKey: queryKeys.sandbox.messages(search, unreadOnly),
    queryFn: () => fetchSandboxMessages({ search, unread: unreadOnly }),
    enabled: Boolean(user?.onboarding_completed && inboxEnabled),
    staleTime: 15_000,
  });
}

export function useSandboxMessage(messageId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.sandbox.message(messageId ?? ''),
    queryFn: async () => {
      const result = await fetchSandboxMessage(messageId!);
      markMessageReadInCache(queryClient, result.message.id);
      return result.message;
    },
    enabled: Boolean(user?.onboarding_completed && messageId),
    staleTime: 60_000,
    retry: false,
  });
}

export function useSandboxMessageRaw(messageId: string | undefined, enabled: boolean) {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.sandbox.messageRaw(messageId ?? ''),
    queryFn: () => fetchSandboxMessageRaw(messageId!),
    enabled: Boolean(user?.onboarding_completed && messageId && enabled),
    staleTime: 60_000,
    retry: false,
  });
}

export function useSandboxMutations(filters: SandboxMessageFilters = {}) {
  const queryClient = useQueryClient();
  const search = filters.search?.trim() || undefined;
  const unreadOnly = Boolean(filters.unread);

  const invalidateMessages = () =>
    queryClient.invalidateQueries({
      queryKey: queryKeys.sandbox.messages(search, unreadOnly),
    });

  const enable = useMutation({
    mutationFn: enableSandbox,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.sandbox.all, data);
      void queryClient.invalidateQueries({
        predicate: (query) => isSandboxListQueryKey(query.queryKey),
      });
    },
  });

  const markAllRead = useMutation({
    mutationFn: markAllSandboxMessagesRead,
    onSuccess: () => {
      queryClient.setQueriesData<EmailMessageListResponse>(
        { predicate: (query) => isSandboxListQueryKey(query.queryKey) },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((item) => ({ ...item, is_read: true })),
          };
        },
      );
      queryClient.setQueryData<SandboxResponse>(queryKeys.sandbox.all, (old) => {
        if (!old?.inbox) return old;
        return {
          ...old,
          inbox: { ...old.inbox, unread_count: 0 },
        };
      });
    },
  });

  const clearAll = useMutation({
    mutationFn: clearSandboxMessages,
    onSuccess: () => {
      queryClient.setQueryData<SandboxResponse>(queryKeys.sandbox.all, (old) => {
        if (!old?.inbox) return old;
        return {
          ...old,
          inbox: {
            ...old.inbox,
            messages_count: 0,
            unread_count: 0,
          },
          stats: old.stats ? { ...old.stats, messages_last_24h: 0 } : old.stats,
        };
      });
      queryClient.setQueriesData<EmailMessageListResponse>(
        { predicate: (query) => isSandboxListQueryKey(query.queryKey) },
        (old) => (old ? { ...old, data: [], meta: { ...old.meta, total: 0 } } : old),
      );
    },
  });

  return { enable, markAllRead, clearAll };
}
