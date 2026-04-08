import { useState, useCallback } from 'react';
import { useRouter, Stack } from 'expo-router';
import { useAuthStore } from '@/stores';
import { authService } from '@/services';
import type { LoginRequest, RegisterRequest } from '@/types';

interface UseAuthReturn {
  isLoading: boolean;
  error: string | null;
  login: (data: LoginRequest) => Promise<boolean>;
  register: (data: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { setAuth, logout: storeLogout } = useAuthStore();

  const login = useCallback(async (data: LoginRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(data);
      await setAuth({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Đăng nhập thất bại';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setAuth]);

  const register = useCallback(async (data: RegisterRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.register(data);
      await setAuth({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Đăng ký thất bại';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setAuth]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      await storeLogout();
      router.replace('/(auth)/login');
      setIsLoading(false);
    }
  }, [storeLogout, router]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };
}
