import { api, getCached, invalidateApiCacheByPrefix } from './apiClient';

const getCurrentUserId = () => {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user?.id ?? null;
  } catch {
    return null;
  }
};

const notificationService = {
  // Get notifications for logged-in user
  getUserNotifications: async () => {
    const userId = getCurrentUserId();
    return getCached(`/notifications/user/${userId || 0}`);
  },

  // Get unread notification count
  getUnreadCount: async () => {
    const userId = getCurrentUserId();
    const count = await getCached(`/notifications/user/${userId || 0}/unread-count`, {}, { ttlMs: 60 * 1000 });
    return typeof count === 'number' ? count : 0;
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    const userId = getCurrentUserId();
    const response = await api.patch(`/notifications/user/${userId || 0}/${notificationId}/read`);
    invalidateApiCacheByPrefix(`/notifications/user/${userId || 0}`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const userId = getCurrentUserId();
    const response = await api.patch(`/notifications/user/${userId || 0}/read-all`);
    invalidateApiCacheByPrefix(`/notifications/user/${userId || 0}`);
    return response.data;
  },

  // Admin - Create announcement
  createAnnouncement: async (announcementData) => {
    const response = await api.post('/notifications', announcementData);
    invalidateApiCacheByPrefix('/notifications/user/');
    invalidateApiCacheByPrefix('/notifications/');
    return response.data;
  },

  // Admin - Get all notifications
  getAllNotifications: async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = (user?.role || 'ADMIN').toUpperCase();
    return getCached(`/notifications/${role}`);
  },

  // Admin - Delete notification
  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    invalidateApiCacheByPrefix('/notifications/user/');
    invalidateApiCacheByPrefix('/notifications/');
    return response.data;
  }
};

export default notificationService;
