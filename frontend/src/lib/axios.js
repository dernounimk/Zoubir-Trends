// frontend/src/lib/axios.js
import axios from "axios";

const isProduction = import.meta.env.MODE === "production";

const axiosInstance = axios.create({
  baseURL: "https://zoubir-trends-backend.onrender.com", // 🔥 بدون /api هنا
  withCredentials: true,
  timeout: 10000,
});

// إضافة interceptor لمعالجة الأخطاء
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;