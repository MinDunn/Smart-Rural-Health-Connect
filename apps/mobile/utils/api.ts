import axios from 'axios';
import { Platform } from 'react-native';

// Đã cập nhật đúng IP: 192.168.1.10 và Cổng: 3001 của Backend NestJS
const DEV_BACKEND_URL = 'http://192.168.1.10:3001';

const api = axios.create({
  baseURL: DEV_BACKEND_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
