import { useEffect, useRef } from 'react';
import { type InfiniteData, useQueryClient } from '@tanstack/react-query';
import { fetchSandboxMessageSidebar } from '@/lib/api/sandbox';
import { getEmailSocket, joinUserRoom, type NewEmailPayload } from '@/lib/email-socket';
import { queryKeys } from '@/lib/query-keys';
import type { EmailMessageListResponse, EmailMessageSummary, SandboxResponse } from '@/types';

type SandboxMessagesInfinite = InfiniteData<EmailMessageListResponse, string | undefined>;

function patchSandboxCounts(
  queryClient: ReturnType<typeof useQueryClient>,
  message: EmailMessageSummary,
) {
  queryClient.setQueryData<SandboxResponse>(queryKeys.sandbox.all, (old) => {
    if (!old?.inbox) return old;
    return {
      ...old,
      inbox: {
        ...old.inbox,
        messages_count: old.inbox.messages_count + 1,
        unread_count: message.is_read ? old.inbox.unread_count : old.inbox.unread_count + 1,
      },
      stats: old.stats
        ? { ...old.stats, messages_last_24h: old.stats.messages_last_24h + 1 }
        : old.stats,
    };
  });
}

function upsertMessage(
  current: SandboxMessagesInfinite | undefined,
  incoming: EmailMessageSummary,
  perPage: number,
): SandboxMessagesInfinite | undefined {
  if (!current || current.pages.length === 0) {
    return current;
  }

  const [firstPage, ...rest] = current.pages;
  const withoutDuplicate = firstPage.data.filter((entry) => entry.id !== incoming.id);

  return {
    ...current,
    pages: [
      {
        ...firstPage,
        data: [incoming, ...withoutDuplicate].slice(0, perPage),
      },
      ...rest,
    ],
    pageParams: current.pageParams,
  };
}

export function useSandboxRealtime(options: {
  userId?: string | number;
  enabled: boolean;
  search?: string;
  unreadOnly?: boolean;
  onNewMessage?: (message: EmailMessageSummary) => void;
}) {
  const queryClient = useQueryClient();
  const search = options.search?.trim() || undefined;
  const unreadOnly = Boolean(options.unreadOnly);
  const onNewMessageRef = useRef(options.onNewMessage);
  onNewMessageRef.current = options.onNewMessage;

  useEffect(() => {
    if (!options.enabled || !options.userId) {
      return;
    }

    joinUserRoom(options.userId);
    const socket = getEmailSocket();

    const onNew = async (payload: NewEmailPayload) => {
      if (payload.type === 'virtual') {
        return;
      }

      const listKey = queryKeys.sandbox.messages(search, unreadOnly);

      if (search) {
        void queryClient.invalidateQueries({ queryKey: listKey });
        return;
      }

      try {
        const message = await fetchSandboxMessageSidebar(payload.id);

        if (unreadOnly && message.is_read) {
          return;
        }

        queryClient.setQueryData<SandboxMessagesInfinite>(listKey, (current) => {
          const perPage = current?.pages[0]?.meta.per_page ?? 30;
          return upsertMessage(current, message, perPage);
        });
        patchSandboxCounts(queryClient, message);
        onNewMessageRef.current?.(message);
      } catch {
        void queryClient.invalidateQueries({ queryKey: listKey });
      }
    };

    socket.on('new-email', onNew);

    return () => {
      socket.off('new-email', onNew);
    };
  }, [options.enabled, options.userId, queryClient, search, unreadOnly]);
}
