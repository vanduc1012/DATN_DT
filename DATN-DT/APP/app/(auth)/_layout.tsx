import React from 'react';
import { Stack } from 'expo-router';
import { useAuthStore } from '@/stores';
import { router } from 'expo-router';
import { useEffect } from 'react';

export default function AuthLayout() {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
