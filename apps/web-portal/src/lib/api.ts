import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
});

// Add interceptor for token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('srhc_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const authApi = {
  login: (data: any) => api.post('/auth/login', data),
  getHealthWorkers: () => api.get('/users/health-workers'),
  getUserById: (id: string) => api.get(`/users/${id}`),
};

export const patientApi = {
  getProfile: (userId: string) => api.get(`/patients/${userId}`),
  getAllPatients: () => api.get('/patients'),
  addHealthProfile: (userId: string, data: any) => api.post(`/patients/${userId}/health-profiles`, data),
};

export const clinicalApi = {
  getHistory: (patientId: string) => api.get(`/clinical/history/${patientId}`),
  createAppointment: (data: any) => api.post('/clinical/appointments', data),
  getPendingRequests: () => api.get('/clinical/requests/pending'),
  getAcceptedRequests: () => api.get('/clinical/requests/accepted'),
  acceptRequest: (id: string) => api.patch(`/clinical/appointments/${id}/accept`),
  getDashboardStats: () => api.get('/clinical/dashboard/stats'),
  getRecentActivity: () => api.get('/clinical/dashboard/activity'),
  completeConsultation: (id: string, data: any) => api.post(`/clinical/appointments/${id}/complete`, data),
  getConsultationResult: (id: string) => api.get(`/clinical/appointments/${id}/result`),
  getLatestConsultation: (patientId: string) => api.get(`/clinical/patients/${patientId}/latest-consultation`),
};

export const iotApi = {
  getMetrics: (patientId: string) => api.get(`/iot/metrics/${patientId}`),
  saveMetric: (data: any) => api.post('/iot/metrics', data),
};

export default api;
