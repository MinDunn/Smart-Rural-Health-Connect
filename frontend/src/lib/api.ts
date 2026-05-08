import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
});

// Add interceptor for token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const patientApi = {
  getProfile: (userId: string) => api.get(`/patients/${userId}`),
  updateProfile: (userId: string, data: any) => api.put(`/patients/${userId}`, data),
  addHealthProfile: (userId: string, data: any) => api.post(`/patients/${userId}/health-profiles`, data),
};

export const clinicalApi = {
  getHistory: (patientId: string) => api.get(`/clinical/history/${patientId}`),
  createAppointment: (data: any) => api.post('/clinical/appointments', data),
  addConsultation: (appointmentId: string, data: any) => api.post(`/clinical/appointments/${appointmentId}/consultation`, data),
  addPrescription: (consultationId: string, data: any) => api.post(`/clinical/consultations/${consultationId}/prescription`, data),
  getLatestPrescription: (patientId: string) => api.get(`/clinical/latest-prescription/${patientId}`),
};

export const iotApi = {
  getMetrics: (patientId: string) => api.get(`/iot/metrics/${patientId}`),
  getStability: (patientId: string) => api.get(`/iot/stability/${patientId}`),
  saveMetric: (data: any) => api.post('/iot/metrics', data),
};

export default api;
