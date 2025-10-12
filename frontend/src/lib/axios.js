import axios from "axios";

const isProduction = import.meta.env.MODE === "production";

const axiosInstance = axios.create({
  baseURL: isProduction
    ? "https://zoubir-trends-backend.onrender.com/api" // لما يكون الموقع على Vercel
    : "http://localhost:5000/api",                     // لما تشتغل محلياً
  withCredentials: true,
});

export default axiosInstance;
