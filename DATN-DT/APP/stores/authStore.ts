import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  setAuth: (data: {
    user: User;
    accessToken: string;
    refreshToken?: string;
  }) => Promise<void>;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  setAuth: async (data) => {
    try {
      await AsyncStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) {
        await AsyncStorage.setItem('refreshToken', data.refreshToken);
      }
      set({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || null,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Error setting auth:', error);
      throw error;
    }
  },

  setUser: (user) => {
    set({ user });
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  },

  initialize: async () => {
    try {
      set({ isLoading: true });
      const accessToken = await AsyncStorage.getItem('accessToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');

      if (accessToken) {
        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isInitialized: true,
          isLoading: false,
        });
      } else {
        set({
          isAuthenticated: false,
          isInitialized: true,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({
        isAuthenticated: false,
        isInitialized: true,
        isLoading: false,
      });
    }
  },
}));
