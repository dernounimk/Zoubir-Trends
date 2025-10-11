import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://192.168.143.229:5000/api"
      : "https://zoubir-trends-backend.onrender.com/api",
  withCredentials: true,
});

export default axiosInstance;
