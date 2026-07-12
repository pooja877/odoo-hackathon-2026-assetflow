import api from './api';

const notificationService = {
  async getNotifications(params = {}) {
    const { data } = await api.get('/notifications', { params });
    return data;
  },
  async getActivityLogs(params = {}) {
    const { data } = await api.get('/notifications/activity-logs', { params });
    return data;
  },
  async markAsRead(id) {
    const { data } = await api.patch(`/notifications/${id}/read`);
    return data;
  },
  async markAllAsRead() {
    const { data } = await api.patch('/notifications/read-all');
    return data;
  },
};

export default notificationService;
