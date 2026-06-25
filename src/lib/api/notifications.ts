import type { AppNotification, NotificationsListResponse } from '@/types';
import { api } from '@/lib/api';

export async function fetchNotifications(): Promise<NotificationsListResponse> {
  const { data } = await api.get<NotificationsListResponse>('/notifications');
  return data;
}

export async function fetchUnreadNotificationCount(): Promise<number> {
  const { data } = await api.get<{ unread_count: number }>('/notifications/unread-count');
  return data.unread_count;
}

export async function markNotificationRead(id: string): Promise<AppNotification> {
  const { data } = await api.post<{ notification: AppNotification }>(`/notifications/${id}/read`);
  return data.notification;
}

export async function markAllNotificationsRead(): Promise<number> {
  const { data } = await api.post<{ updated: number }>('/notifications/read-all');
  return data.updated;
}
