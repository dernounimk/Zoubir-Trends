import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useAdminAuthStore = create(
  persist(
    (set, get) => ({
      admin: null,
      accessToken: null,
      refreshToken: null,
      loading: false,
      checkingAuth: true,

      login: async (email, password, navigate) => {
        set({ loading: true });
        try {
          const res = await axios.post("/api/auth/login", { email, password });
          
          if (res.data && res.data.user) {
            set({ 
              admin: res.data.user,
              accessToken: res.data.accessToken,
              refreshToken: res.data.refreshToken,
              loading: false 
            });
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
          const { refreshToken } = get();
          if (refreshToken) {
            await axios.post("/api/auth/logout", { refreshToken });
          }
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          set({ admin: null, accessToken: null, refreshToken: null });
          toast.success("Logged out successfully");
        }
      },

      checkAuth: async () => {
        set({ checkingAuth: true });
        try {
          const { accessToken } = get();
          if (!accessToken) {
            set({ checkingAuth: false, admin: null });
            return;
          }

          const response = await axios.get("/api/auth/profile", {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          
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
        try {
          const { refreshToken } = get();
          if (!refreshToken) throw new Error("No refresh token");

          const response = await axios.post("/api/auth/refresh-token", { refreshToken });
          set({ accessToken: response.data.accessToken });
          return response.data;
        } catch (error) {
          set({ admin: null, accessToken: null, refreshToken: null });
          throw error;
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        admin: state.admin,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);