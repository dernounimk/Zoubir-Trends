import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useAdminAuthStore = create((set, get) => ({
  admin: { name: null, role: null },
  loading: false,
  checkingAuth: true,

  login: async (email, password, navigate) => {
    set({ loading: true });
    try {
      const res = await axios.post("/auth/login", { email, password });
      if (res.status === 200) {
        set({ admin: res.data, loading: false });
        if (navigate) navigate("/dash");
      } else {
        set({ loading: false });
      }

    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message);
    }
  },

  logout: async () => {
    try {
      await axios.post("/auth/logout");
      set({ admin: null });
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  },

  checkAuth: async () => {
    set({ checkingAuth: true });
    try {
      const response = await axios.get("/auth/profile");
      set({ admin: response.data, checkingAuth: false });
    } catch (error) {
      set({ checkingAuth: false, admin: null });
    }
  },

  refreshToken: async () => {
    if (get().checkingAuth) return;
    set({ checkingAuth: true });
    try {
      const response = await axios.post("/auth/refresh-token");
      set({ checkingAuth: false });
      return response.data;
    } catch (error) {
      set({ admin: null, checkingAuth: false });
      throw error;
    }
  },
}));

let refreshPromise = null;

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (refreshPromise) {
          await refreshPromise;
          return axios(originalRequest);
        }

        refreshPromise = useAdminAuthStore.getState().refreshToken();
        await refreshPromise;
        refreshPromise = null;

        return axios(originalRequest);
      } catch (refreshError) {
        useAdminAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);