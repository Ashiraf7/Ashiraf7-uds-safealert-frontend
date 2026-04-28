import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('safealert_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    console.error('API error:', err.response?.data || err.message);
    return Promise.reject(err.response?.data || err);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  sendOTP: (phone) => api.post('/auth/otp/send', { phone }),
  verifyOTP: (phone, code) => api.post('/auth/otp/verify', { phone, code }),
  login: (data) => api.post('/auth/login', data),
};

// Alerts
export const alertsAPI = {
  getAll: (params) => api.get('/alerts', { params }),
  create: (data) => api.post('/alerts', data),
  resolve: (id) => api.patch(`/alerts/${id}/resolve`),
  respond: (id) => api.post(`/alerts/${id}/respond`),
  getNearby: (lat, lng, radius) =>
    api.get('/alerts/nearby', { params: { lat, lng, radius } }),
};

// Users
export const usersAPI = {
  updateLocation: (lat, lng) => api.put('/users/location', { lat, lng }),
  updateProfile: (data) => api.put('/users/profile', data),
  getNearbyCount: (lat, lng, radius) =>
    api.get('/users/nearby', { params: { lat, lng, radius } }),
};

// Admin
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  broadcast: (data) => api.post('/admin/broadcast', data),
  getIncidents: () => api.get('/admin/incidents'),
};

export default api;
