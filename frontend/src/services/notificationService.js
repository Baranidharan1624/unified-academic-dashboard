import apiClient from './apiClient';

const notificationService = {
  // Get notifications for logged-in user
  getUserNotifications: async () => {
    const response = await apiClient.get('/user/notifications');
    return response.data;
  },

  // Get unread notification count
  getUnreadCount: async () => {
    const response = await apiClient.get('/user/notifications/unread-count');
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    const response = await apiClient.patch(`/user/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await apiClient.patch('/user/notifications/read-all');
    return response.data;
  },

  // Admin - Create announcement
  createAnnouncement: async (announcementData) => {
    const response = await apiClient.post('/admin/notifications', announcementData);
    return response.data;
  },

  // Admin - Broadcast to all
  broadcastAnnouncement: async (announcementData) => {
    const response = await apiClient.post('/admin/notifications/broadcast', announcementData);
    return response.data;
  },

  // Admin - Get all notifications
  getAllNotifications: async () => {
    const response = await apiClient.get('/admin/notifications');
    return response.data;
  },

  // Admin - Delete notification
  deleteNotification: async (id) => {
    const response = await apiClient.delete(`/admin/notifications/${id}`);
    return response.data;
  }
};

export default notificationService;
