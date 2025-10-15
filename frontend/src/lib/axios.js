// lib/axios.js
import axios from "axios";
import { useAdminAuthStore } from "../stores/useAdminAuthStore";

const axiosInstance = axios.create({
  baseURL: "https://zoubir-trends-backend.onrender.com",
  timeout: 15000,
});

// 🔥 إضافة /api تلقائياً لجميع ال requests
axiosInstance.interceptors.request.use(
  (config) => {
    // أضف /api تلقائياً إذا لم تكن موجودة
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
    
    console.log(`🔧 Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => Promise.reject(error)
);

// معالجة أخطاء التوكن
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ Response: ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  async (error) => {
    console.log(`❌ Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
    
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