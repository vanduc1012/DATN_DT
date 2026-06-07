import axios from 'axios';
import { getAccessToken, getRefreshToken } from '../utils/authToken';

export const request = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    withCredentials: true,
    timeout: 30000,
});

request.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    const refreshToken = getRefreshToken();
    if (refreshToken) {
        config.headers['x-refresh-token'] = refreshToken;
    }
    return config;
});
