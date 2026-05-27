import { apiClient } from './axiosClient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Lấy tất cả đánh giá
export const getAllReviews = async (params = {}) => {
    const response = await apiClient.get(`${API_URL}/api/reviews/all`, { params });
    return response.data;
};

// Lấy đánh giá của một sân
export const getReviewsByField = async (fieldId, params = {}) => {
    const response = await apiClient.get(`${API_URL}/api/reviews/field/${fieldId}`, { params });
    return response.data;
};

// Tạo đánh giá mới
export const createReview = async (data) => {
    const response = await apiClient.post(`${API_URL}/api/reviews/create`, data);
    return response.data;
};

// Kiểm tra có thể đánh giá không
export const canReview = async (bookingId) => {
    const response = await apiClient.get(`${API_URL}/api/reviews/can-review/${bookingId}`);
    return response.data;
};

// Lấy review của user cho booking
export const getMyReviewForBooking = async (bookingId) => {
    const response = await apiClient.get(`${API_URL}/api/reviews/my-review/${bookingId}`);
    return response.data;
};

// Xóa đánh giá
export const deleteReview = async (reviewId) => {
    const response = await apiClient.delete(`${API_URL}/api/reviews/${reviewId}`);
    return response.data;
};
