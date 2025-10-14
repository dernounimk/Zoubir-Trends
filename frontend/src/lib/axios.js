// frontend/src/lib/axios.js
import axios from "axios";
import { useAdminAuthStore } from "../stores/useAdminAuthStore";

const axiosInstance = axios.create({
  baseURL: "https://zoubir-trends-backend.onrender.com",
  timeout: 15000,
});

// 🔥 إصلاح تلقائي لجميع الـ routes
axiosInstance.interceptors.request.use(
  (config) => {
    // أضف /api تلقائياً لجميع الـ routes ما عدا health
    if (config.url && 
        !config.url.startsWith('/api/') && 
        !config.url.startsWith('/auth/') && 
        config.url !== '/health' &&
        !config.url.includes('.')) {
      config.url = '/api' + config.url;
    }
    
    const { accessToken } = useAdminAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// معالجة أخطاء التوكن
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await useAdminAuthStore.getState().refreshToken();
        return axiosInstance(originalRequest);
      } catch {
        useAdminAuthStore.getState().logout();
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;