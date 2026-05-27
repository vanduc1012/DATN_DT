import axios from 'axios';
import { apiClient } from './axiosClient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Get all prices by field ID
export const getFieldPrices = async (fieldId) => {
    const response = await axios.get(`${API_URL}/api/field-prices/${fieldId}`);
    return response.data;
};

// Get price by ID
export const getFieldPriceById = async (id) => {
    const response = await axios.get(`${API_URL}/api/field-prices/detail/${id}`);
    return response.data;
};

// Create new price
export const createFieldPrice = async (data) => {
    const response = await apiClient.post(`${API_URL}/api/field-prices/create`, data);
    return response.data;
};

// Update price
export const updateFieldPrice = async (id, data) => {
    const response = await axios.put(`${API_URL}/api/field-prices/update/${id}`, data);
    return response.data;
};

// Delete price
export const deleteFieldPrice = async (id) => {
    const response = await axios.delete(`${API_URL}/api/field-prices/delete/${id}`);
    return response.data;
};
