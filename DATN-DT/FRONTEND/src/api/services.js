import api from './axios';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const pitchAPI = {
  getAll: (params) => api.get('/pitches', { params }),
  getById: (id) => api.get(`/pitches/${id}`),
  getMy: () => api.get('/pitches/my'),
  create: (data) => api.post('/pitches', data),
  update: (id, data) => api.put(`/pitches/${id}`, data),
  delete: (id) => api.delete(`/pitches/${id}`),
  uploadImages: (id, formData) => api.post(`/pitches/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteImage: (id, imageUrl) => api.delete(`/pitches/${id}/images`, { data: { imageUrl } }),
};

export const bookingAPI = {
  getAvailableSlots: (pitchId, date) =>
    api.get(`/bookings/available/${pitchId}`, { params: { date } }),
  getMy: () => api.get('/bookings/my'),
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
  pay: (id, paymentMethod) => api.patch(`/bookings/${id}/payment`, { paymentMethod }),
};

export const reviewAPI = {
  getByPitch: (pitchId) => api.get(`/reviews/${pitchId}`),
  create: (pitchId, data) => api.post(`/reviews/${pitchId}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/me', data),
  toggleStatus: (id) => api.patch(`/users/${id}/toggle-status`),
  delete: (id) => api.delete(`/users/${id}`),
};

export const statsAPI = {
  getOverview: () => api.get('/stats/overview'),
  getRevenue: (params) => api.get('/stats/revenue', { params }),
  getTopPitches: () => api.get('/stats/top-pitches'),
};
