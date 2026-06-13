import { api, unwrap } from '../client';

export interface ApiNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  iconKey?: string;
  tint?: string;
  data?: Record<string, unknown>;
  readAt?: string;
  createdAt: string;
}

export const NotificationsService = {
  async list(): Promise<ApiNotification[]> {
    return unwrap<ApiNotification[]>(api.get('/notifications'));
  },
  async unreadCount(): Promise<number> {
    const res = await unwrap<{ count: number }>(api.get('/notifications/unread-count'));
    return res.count;
  },
  async markRead(id: string): Promise<ApiNotification> {
    return unwrap<ApiNotification>(api.patch(`/notifications/${id}/read`));
  },
  async markAllRead(): Promise<void> {
    await unwrap(api.patch('/notifications/read-all'));
  },
  async remove(id: string): Promise<void> {
    await unwrap(api.delete(`/notifications/${id}`));
  },
  async bulkRemove(ids: string[]): Promise<{ deleted: number }> {
    return unwrap<{ deleted: number }>(api.post('/notifications/bulk-delete', { ids }));
  },
};
