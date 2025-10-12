import axios from "axios";

const isProduction = import.meta.env.MODE === "production";

const axiosInstance = axios.create({
  baseURL: isProduction
    ? "https://zoubir-trends-backend.onrender.com/api"
    : "http://localhost:5000/api",
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