import { request } from './request';
import { apiClient } from './axiosClient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// [Public] Get all fields with pagination and filters
export const getAllFields = async (params = {}) => {
    const response = await request.get(`${API_URL}/api/fields`, { params });
    return response.data;
};

// [Public] Get field by ID
export const getFieldById = async (id) => {
    const response = await request.get(`${API_URL}/api/fields/${id}`);
    return response.data;
};

// [Admin] Create new field
export const createField = async (formData) => {
    const response = await apiClient.post(`${API_URL}/api/fields/create`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

// [Admin] Update field
export const updateField = async (id, formData) => {
    const response = await apiClient.put(`${API_URL}/api/fields/update/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

// [Admin] Delete field
export const deleteField = async (id) => {
    const response = await apiClient.delete(`${API_URL}/api/fields/delete/${id}`);
    return response.data;
};

// [Admin] Update field status
export const updateFieldStatus = async (id, status) => {
    const response = await apiClient.patch(`${API_URL}/api/fields/status/${id}`, { status });
    return response.data;
};
