import { apiClient } from './axiosClient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Admin: Lấy tất cả users
export const getAllUsers = async () => {
    const response = await apiClient.get(`${API_URL}/api/users/admin/users`);
    return response.data;
};

// Admin: Cập nhật user
export const updateUserAdmin = async (userId, data) => {
    const response = await apiClient.put(`${API_URL}/api/users/admin/users/${userId}`, data);
    return response.data;
};

// Admin: Xóa user
export const deleteUserAdmin = async (userId) => {
    const response = await apiClient.delete(`${API_URL}/api/users/admin/users/${userId}`);
    return response.data;
};
