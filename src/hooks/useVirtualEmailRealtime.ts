import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getEmailSocket, joinUserRoom, type NewEmailPayload } from '@/lib/email-socket';
import { queryKeys } from '@/lib/query-keys';

export function useVirtualEmailRealtime(options: {
  userId?: string | number;
  virtualEmailId?: string;
  enabled: boolean;
  onNewMessage?: (payload: NewEmailPayload) => void;
}) {
  const queryClient = useQueryClient();
  const onNewMessageRef = useRef(options.onNewMessage);
  onNewMessageRef.current = options.onNewMessage;

  useEffect(() => {
    if (!options.enabled || !options.userId || !options.virtualEmailId) {
      return;
    }

    const virtualEmailId = options.virtualEmailId;
    joinUserRoom(options.userId);
    const socket = getEmailSocket();

    const onNew = (payload: NewEmailPayload) => {
      if (payload.type !== 'virtual' || payload.virtual_email_id !== virtualEmailId) {
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: ['virtual-emails', virtualEmailId, 'messages'],
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.virtualEmails.detail(virtualEmailId),
        exact: true,
      });
      // Refresh workspace virtual-email list counts (keys like ["virtual-emails", search]).
      void queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'virtual-emails' && query.queryKey.length === 2,
      });

      onNewMessageRef.current?.(payload);
    };

    socket.on('new-email', onNew);

    return () => {
      socket.off('new-email', onNew);
    };
  }, [options.enabled, options.userId, options.virtualEmailId, queryClient]);
}
