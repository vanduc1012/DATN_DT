import { apiClient } from './axiosClient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Lấy thống kê tổng quan
export const getDashboardStats = async (period = '7days') => {
    const response = await apiClient.get(`${API_URL}/api/dashboard/stats`, { params: { period } });
    return response.data;
};

// Lấy dữ liệu biểu đồ doanh thu
export const getRevenueChart = async (days = 7) => {
    const response = await apiClient.get(`${API_URL}/api/dashboard/revenue-chart`, { params: { days } });
    return response.data;
};

// Lấy phân bố loại sân
export const getFieldDistribution = async () => {
    const response = await apiClient.get(`${API_URL}/api/dashboard/field-distribution`);
    return response.data;
};

// Lấy top sân được đặt nhiều
export const getTopBookedFields = async (limit = 5) => {
    const response = await apiClient.get(`${API_URL}/api/dashboard/top-fields`, { params: { limit } });
    return response.data;
};

// Lấy đơn đặt gần đây
export const getRecentBookings = async (limit = 10) => {
    const response = await apiClient.get(`${API_URL}/api/dashboard/recent-bookings`, { params: { limit } });
    return response.data;
};

// Lấy tất cả dữ liệu dashboard một lần (recommended)
export const getFullDashboard = async (period = '7days') => {
    const response = await apiClient.get(`${API_URL}/api/dashboard/full`, { params: { period } });
    return response.data;
};
