import apiService from './api';
import { ENDPOINTS } from '@/constants/api';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from '@/types';

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiService.post<{ data: AuthResponse }>(
      ENDPOINTS.AUTH.LOGIN,
      data
    );
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiService.post<{ data: AuthResponse }>(
      ENDPOINTS.AUTH.REGISTER,
      data
    );
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiService.post(ENDPOINTS.AUTH.LOGOUT);
  },

  getMe: async (): Promise<User> => {
    const response = await apiService.get<{ data: User }>(ENDPOINTS.AUTH.ME);
    return response.data;
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    await apiService.put(ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiService.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },
};
