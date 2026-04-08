import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '@/constants/api';
import { router } from 'expo-router';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: AxiosError) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await AsyncStorage.getItem('accessToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({
                resolve: (token: string) => {
                  if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                  }
                  resolve(this.api(originalRequest));
                },
                reject: (err: AxiosError) => {
                  reject(err);
                },
              });
            });
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            const refreshToken = await AsyncStorage.getItem('refreshToken');
            if (refreshToken) {
              const { data } = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh-token`, {
                refreshToken,
              });
              const newToken = data.data?.accessToken;
              await AsyncStorage.setItem('accessToken', newToken);
              if (data.data?.refreshToken) {
                await AsyncStorage.setItem('refreshToken', data.data.refreshToken);
              }
              processQueue(null, newToken);
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }
              return this.api(originalRequest);
            }
            throw new Error('No refresh token');
          } catch (err) {
            processQueue(err as AxiosError, null);
            await this.clearTokens();
            router.replace('/(auth)/login');
            return Promise.reject(err);
          } finally {
            isRefreshing = false;
          }
        }

        if (error.response?.status === 403) {
          router.replace('/(auth)/login');
        }

        return Promise.reject(error);
      }
    );
  }

  private async clearTokens() {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
  }

  public async get<T>(url: string, params?: Record<string, unknown>) {
    const response = await this.api.get<T>(url, { params });
    return response.data;
  }

  public async post<T>(url: string, data?: unknown) {
    const response = await this.api.post<T>(url, data);
    return response.data;
  }

  public async put<T>(url: string, data?: unknown) {
    const response = await this.api.put<T>(url, data);
    return response.data;
  }

  public async patch<T>(url: string, data?: unknown) {
    const response = await this.api.patch<T>(url, data);
    return response.data;
  }

  public async delete<T>(url: string, data?: unknown) {
    const response = await this.api.delete<T>(url, { data });
    return response.data;
  }

  public async uploadFormData<T>(url: string, formData: FormData) {
    const response = await this.api.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
