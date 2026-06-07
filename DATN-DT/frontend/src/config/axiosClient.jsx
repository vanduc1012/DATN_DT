import axios from 'axios';
import Cookies from 'js-cookie';
import { requestRefreshToken } from './UserRequest';
import { clearAuthTokens, getAccessToken, getRefreshToken, hasAuthSession } from '../utils/authToken';

export class ApiClient {
    constructor(baseURL) {
        this.baseURL = baseURL || import.meta.env.VITE_API_URL || 'http://localhost:3000';
        this.axiosInstance = axios.create({
            baseURL: this.baseURL,
            timeout: 30000,
            withCredentials: true,
        });

        this.isRefreshing = false;
        this.failedQueue = [];

        this.setupInterceptors();
    }

    setupInterceptors() {
        // Request interceptor
        this.axiosInstance.interceptors.request.use(
            (config) => {
                const token = getAccessToken();
                if (token) config.headers.Authorization = `Bearer ${token}`;
                const refreshToken = getRefreshToken();
                if (refreshToken) config.headers['x-refresh-token'] = refreshToken;
                return config;
            },
            (error) => Promise.reject(error),
        );

        // Response interceptor
        this.axiosInstance.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                if (error.response?.status === 401 && !originalRequest._retry) {
                    if (!this.isLoggedIn()) {
                        this.handleAuthFailure();
                        return Promise.reject(error);
                    }

                    if (this.isRefreshing) {
                        return new Promise((resolve, reject) => {
                            this.failedQueue.push({ resolve, reject });
                        })
                            .then(() => this.axiosInstance(originalRequest))
                            .catch((err) => Promise.reject(err));
                    }

                    originalRequest._retry = true;
                    this.isRefreshing = true;

                    try {
                        await this.refreshToken();
                        this.processQueue(null);
                        return this.axiosInstance(originalRequest);
                    } catch (refreshError) {
                        this.processQueue(refreshError);
                        this.handleAuthFailure();
                        return Promise.reject(refreshError);
                    } finally {
                        this.isRefreshing = false;
                    }
                }

                return Promise.reject(error);
            },
        );
    }

    async refreshToken() {
        try {
            await requestRefreshToken();
            console.log('Token refreshed successfully');
        } catch (error) {
            console.error('Failed to refresh token:', error);
            throw error;
        }
    }

    processQueue(error) {
        this.failedQueue.forEach(({ resolve, reject }) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });

        this.failedQueue = [];
    }

    handleAuthFailure() {
        this.logout().finally(() => {
            Cookies.remove('logged');
            clearAuthTokens();
            window.location.href = '/login';
        });
    }

    isLoggedIn() {
        return Cookies.get('logged') === '1' || hasAuthSession();
    }

    async logout() {
        try {
            await this.axiosInstance.get('/api/users/logout');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    checkAuthStatus() {
        return this.isLoggedIn();
    }

    get(url, config) {
        return this.axiosInstance.get(url, config);
    }

    post(url, data, config) {
        return this.axiosInstance.post(url, data, config);
    }

    put(url, data, config) {
        return this.axiosInstance.put(url, data, config);
    }

    delete(url, config) {
        return this.axiosInstance.delete(url, config);
    }

    patch(url, data, config) {
        return this.axiosInstance.patch(url, data, config);
    }
}

// Export instance
export const apiClient = new ApiClient();
