import Constants from 'expo-constants';

export const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
  TIMEOUT: 10000,
};

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    REFRESH_TOKEN: '/auth/refresh-token',
  },
  PITCHES: {
    LIST: '/pitches',
    DETAIL: (id: string) => `/pitches/${id}`,
    MY: '/pitches/my',
    AVAILABLE_SLOTS: (pitchId: string) => `/bookings/available/${pitchId}`,
  },
  BOOKINGS: {
    LIST: '/bookings',
    MY: '/bookings/my',
    DETAIL: (id: string) => `/bookings/${id}`,
    CREATE: '/bookings',
    UPDATE_STATUS: (id: string) => `/bookings/${id}/status`,
    PAY: (id: string) => `/bookings/${id}/payment`,
  },
  REVIEWS: {
    GET_BY_PITCH: (pitchId: string) => `/reviews/${pitchId}`,
    CREATE: (pitchId: string) => `/reviews/${pitchId}`,
    DELETE: (id: string) => `/reviews/${id}`,
  },
  USERS: {
    LIST: '/users',
    DETAIL: (id: string) => `/users/${id}`,
    UPDATE_PROFILE: '/users/me',
    TOGGLE_STATUS: (id: string) => `/users/${id}/toggle-status`,
    DELETE: (id: string) => `/users/${id}`,
  },
  STATS: {
    OVERVIEW: '/stats/overview',
    REVENUE: '/stats/revenue',
    TOP_PITCHES: '/stats/top-pitches',
  },
};
