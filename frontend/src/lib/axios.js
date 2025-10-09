import axios from "axios";

const axiosInstance = axios.create({
	baseURL: import.meta.mode === "development" ? "http://192.168.143.229:5000/api" : "/api",
	withCredentials: true, // send cookies to the server
});

export default axiosInstance;