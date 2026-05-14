import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
});

// Add interceptor for token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('srhc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: any) => api.post('/auth/reset-password', data),
  getHealthWorkers: () => api.get('/users/health-workers'),
  getUserById: (id: string) => api.get(`/users/${id}`),
  updateUserProfile: (id: string, data: any) => api.put(`/users/${id}/profile`, data),
};

export const patientApi = {
  getProfile: (userId: string) => api.get(`/patients/${userId}`),
  getAllPatients: () => api.get('/patients'),
  updateProfile: (userId: string, data: any) => api.put(`/patients/${userId}`, data),
  addHealthProfile: (userId: string, data: any) => api.post(`/patients/${userId}/health-profiles`, data),
};

export const clinicalApi = {
  getHistory: (patientId: string) => api.get(`/clinical/history/${patientId}`),
  createAppointment: (data: any) => api.post('/clinical/appointments', data),
  addConsultation: (appointmentId: string, data: any) => api.post(`/clinical/appointments/${appointmentId}/consultation`, data),
  addPrescription: (consultationId: string, data: any) => api.post(`/clinical/consultations/${consultationId}/prescription`, data),
  getLatestPrescription: (patientId: string) => api.get(`/clinical/latest-prescription/${patientId}`),
  getPendingRequests: () => api.get('/clinical/requests/pending'),
  getAcceptedRequests: () => api.get('/clinical/requests/accepted'),
  acceptRequest: (id: string) => api.patch(`/clinical/appointments/${id}/accept`),
  getDashboardStats: () => api.get('/clinical/dashboard/stats'),
  getRecentActivity: () => api.get('/clinical/dashboard/activity'),
};

export const iotApi = {
  getMetrics: (patientId: string) => api.get(`/iot/metrics/${patientId}`),
  getStability: (patientId: string) => api.get(`/iot/stability/${patientId}`),
  saveMetric: (data: any) => api.post('/iot/metrics', data),
};

export default api;
