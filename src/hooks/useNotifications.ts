import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/lib/api/notifications';
import { queryKeys } from '@/lib/query-keys';
import { useAuth } from '@/hooks/useAuth';

export function useUnreadNotificationCount() {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: fetchUnreadNotificationCount,
    enabled: Boolean(user?.onboarding_completed),
    refetchInterval: 60_000,
  });
}

export function useNotifications(enabled: boolean) {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.notifications.list,
    queryFn: fetchNotifications,
    enabled: enabled && Boolean(user?.onboarding_completed),
  });
}

export function useNotificationMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list });
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount });
  };

  const markRead = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: invalidate,
  });

  const markAllRead = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: invalidate,
  });

  return { markRead, markAllRead };
}
