// stores/useAdminAuthStore.js - الإصدار المصحح
import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useAdminAuthStore = create((set, get) => ({
  admin: null,
  loading: false,
  checkingAuth: true,

  login: async (email, password, navigate) => {
    set({ loading: true });
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      
      if (res.data && res.data.user) {
        set({ admin: res.data.user, loading: false });
        toast.success("Login successful");
        if (navigate) navigate("/dash");
      } else {
        set({ loading: false });
        toast.error("Invalid response from server");
      }
    } catch (error) {
      set({ loading: false });
      const errorMsg = error.response?.data?.message || "Login failed";
      toast.error(errorMsg);
      throw error;
    }
  },

  logout: async () => {
    try {
      await axios.post("/api/auth/logout");
      set({ admin: null });
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      // حتى لو فشل الطلب، نظف الحالة المحلية
      set({ admin: null });
    }
  },

  checkAuth: async () => {
    set({ checkingAuth: true });
    try {
      const response = await axios.get("/api/auth/profile");
      if (response.data && response.data.user) {
        set({ admin: response.data.user, checkingAuth: false });
      } else {
        set({ admin: null, checkingAuth: false });
      }
    } catch (error) {
      console.error("Check auth error:", error);
      set({ checkingAuth: false, admin: null });
    }
  },

  refreshToken: async () => {
    if (get().checkingAuth) return;
    set({ checkingAuth: true });
    try {
      const response = await axios.post("/api/auth/refresh-token");
      set({ checkingAuth: false });
      return response.data;
    } catch (error) {
      set({ admin: null, checkingAuth: false });
      throw error;
    }
  },
}));

// انقل الـ interceptor إلى ملف axios منفصل