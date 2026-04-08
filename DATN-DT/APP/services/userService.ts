import apiService from './api';
import { ENDPOINTS } from '@/constants/api';
import type { User } from '@/types';

interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  avatar?: string;
}

export const userService = {
  getAll: async (): Promise<User[]> => {
    const response = await apiService.get<{ data: User[] }>(ENDPOINTS.USERS.LIST);
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await apiService.get<{ data: User }>(
      ENDPOINTS.USERS.DETAIL(id)
    );
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await apiService.put<{ data: User }>(
      ENDPOINTS.USERS.UPDATE_PROFILE,
      data
    );
    return response.data;
  },

  toggleStatus: async (id: string): Promise<User> => {
    const response = await apiService.patch<{ data: User }>(
      ENDPOINTS.USERS.TOGGLE_STATUS(id)
    );
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiService.delete(ENDPOINTS.USERS.DELETE(id));
  },
};
