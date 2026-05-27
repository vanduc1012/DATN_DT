import { apiClient } from './axiosClient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// [Admin] Get all discounts
export const getAllDiscounts = async (params = {}) => {
    const response = await apiClient.get(`${API_URL}/api/discounts`, { params });
    return response.data;
};

// [Admin] Get discount by ID
export const getDiscountById = async (id) => {
    const response = await apiClient.get(`${API_URL}/api/discounts/${id}`);
    return response.data;
};

// [Admin] Create discount
export const createDiscount = async (data) => {
    const response = await apiClient.post(`${API_URL}/api/discounts/create`, data);
    return response.data;
};

// [Admin] Update discount
export const updateDiscount = async (id, data) => {
    const response = await apiClient.put(`${API_URL}/api/discounts/${id}`, data);
    return response.data;
};

// [Admin] Delete discount
export const deleteDiscount = async (id) => {
    const response = await apiClient.delete(`${API_URL}/api/discounts/${id}`);
    return response.data;
};

// [User] Validate discount code
export const validateDiscount = async (code, orderValue, fieldId = null) => {
    const response = await apiClient.post(`${API_URL}/api/discounts/validate`, {
        code,
        orderValue,
        fieldId,
    });
    return response.data;
};

// [User] Lấy danh sách mã giảm giá phù hợp với đơn hàng
export const getAvailableDiscounts = async (orderValue, fieldId = null) => {
    const response = await apiClient.get(`${API_URL}/api/discounts/available`, {
        params: { orderValue, fieldId },
    });
    return response.data;
};
