import axios from "axios";
import { useAdminAuthStore } from "../stores/useAdminAuthStore";

const axiosInstance = axios.create({
  baseURL: "https://zoubir-trends-backend.onrender.com/api",
  timeout: 10000,
});

// 🔥 interceptor لإضافة التوكن تلقائياً
axiosInstance.interceptors.request.use(
  (config) => {
    const { accessToken } = useAdminAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔥 interceptor لتجديد التوكن عند انتهاء الصلاحية
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await useAdminAuthStore.getState().refreshToken();
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        useAdminAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;