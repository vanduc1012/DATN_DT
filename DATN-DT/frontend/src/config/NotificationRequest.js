import { apiClient } from './axiosClient';

const API_URL = '/api/notifications';

// Get all notifications
export const getNotifications = async (page = 1, limit = 20) => {
    const res = await apiClient.get(`${API_URL}/all`, { params: { page, limit } });
    return res.data;
};

// Get unread count
export const getUnreadCount = async () => {
    const res = await apiClient.get(`${API_URL}/unread-count`);
    return res.data;
};

// Mark a notification as read
export const markAsRead = async (notificationId) => {
    const res = await apiClient.post(`${API_URL}/${notificationId}/read`);
    return res.data;
};

// Mark all notifications as read
export const markAllAsRead = async () => {
    const res = await apiClient.post(`${API_URL}/read-all`);
    return res.data;
};

// Delete a notification
export const deleteNotification = async (notificationId) => {
    const res = await apiClient.delete(`${API_URL}/${notificationId}`);
    return res.data;
};
