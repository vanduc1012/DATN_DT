import { apiClient } from './axiosClient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create booking
export const createBooking = async (data) => {
    const response = await apiClient.post(`${API_URL}/api/bookings/create`, data);
    return response.data;
};

// Get booking by ID
export const getBookingById = async (id) => {
    const response = await apiClient.get(`${API_URL}/api/bookings/${id}`);
    return response.data;
};

// Get bookings by field and date
export const getBookingsByField = async (fieldId, date) => {
    const response = await apiClient.get(`${API_URL}/api/bookings/field/${fieldId}`, {
        params: { date },
    });
    return response.data;
};

// Get user bookings
export const getUserBookings = async () => {
    const response = await apiClient.get(`${API_URL}/api/bookings/my-bookings`);
    return response.data;
};

// Cancel booking
export const cancelBooking = async (id) => {
    const response = await apiClient.put(`${API_URL}/api/bookings/cancel/${id}`);
    return response.data;
};

// [Admin] Cancel booking
export const cancelBookingAdmin = async (id) => {
    const response = await apiClient.put(`${API_URL}/api/bookings/admin/cancel/${id}`);
    return response.data;
};

// Verify MoMo Payment
export const verifyMomoPayment = async (bookingId) => {
    const response = await apiClient.put(`${API_URL}/api/bookings/verify-momo/${bookingId}`);
    return response.data;
};

// Verify VNPay Payment
export const verifyVnpayPayment = async (bookingId) => {
    const response = await apiClient.put(`${API_URL}/api/bookings/verify-vnpay/${bookingId}`);
    return response.data;
};

// [Admin] Get all bookings with filters
export const getAllBookings = async (params = {}) => {
    const response = await apiClient.get(`${API_URL}/api/bookings/admin/all`, { params });
    return response.data;
};

// [Admin] Update booking status
export const updateBookingStatus = async (bookingId, status) => {
    const response = await apiClient.put(`${API_URL}/api/bookings/admin/status/${bookingId}`, { status });
    return response.data;
};
