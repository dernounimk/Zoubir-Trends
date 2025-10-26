import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useProductStore = create((set, get) => ({
  products: [],
  featuredProducts: [],
  loading: false,
  currentPage: 1,
  totalPages: 1,
  totalProducts: 0,

// في useProductStore - تحديث الدالة
fetchAllProducts: async (page = 1, limit = 100) => { // 🔥 زيادة الـ limit
  set({ loading: true });
  try {
    const response = await axios.get(`/products?page=${page}&limit=${limit}`);
    const data = response.data || {};
    
    set({
      products: Array.isArray(data.products) ? data.products : [],
      currentPage: data.currentPage || 1,
      totalPages: data.totalPages || 1,
      totalProducts: data.totalProducts || 0,
      loading: false,
    });
  } catch (error) {
    console.error("Fetch products error:", error);
    set({ 
      products: [],
      loading: false 
    });
  }
},

  fetchFeaturedProducts: async (retryCount = 0) => {
    set({ loading: true });
    try {
      const response = await axios.get("/products/featured");
      set({ 
        featuredProducts: Array.isArray(response.data) ? response.data : [],
        loading: false 
      });
    } catch (error) {
      console.error("Fetch featured products error:", error);
      
      // 🔥 حاول إعادة المحاولة مرة واحدة
      if (retryCount < 1 && error.code !== "ECONNABORTED") {
        console.log("Retrying fetch featured products...");
        setTimeout(() => {
          get().fetchFeaturedProducts(retryCount + 1);
        }, 2000);
        return;
      }
      
      set({ 
        featuredProducts: [],
        loading: false 
      });
    }
  },

  fetchProductsByCategory: async (category) => {
    set({ loading: true });
    try {
      const response = await axios.get(`/products/category/${category}`);
      set({ products: response.data.products || [], loading: false });
    } catch (error) {
      set({ loading: false });
      console.log(error);
    }
  },

  fetchProductById: async (productId) => {
    set({ loading: true });
    try {
      const response = await axios.get(`/products/${productId}`);
      set({ 
        products: [response.data], 
        loading: false 
      });
      return response.data;
    } catch (error) {
      set({ loading: false });
      return null;
    }
  },

  createProduct: async (productData) => {
    set({ loading: true });
    try {
      const payload = {
        ...productData,
        priceBeforeDiscount: productData.priceBeforeDiscount || null,
        priceAfterDiscount: productData.priceAfterDiscount || null
      };
      
      const res = await axios.post("/products", payload);
      set((state) => ({
        products: [...state.products, res.data],
        loading: false,
      }));
      return res.data;
    } catch (error) {
      console.error("Create product error:", error);
      const errorMsg = error.response?.data?.message || "Failed to create product";
      set({ loading: false });
      throw error;
    }
  },

  updateProduct: async (productId, updatedData) => {
    set({ loading: true });
    try {
      const payload = { ...updatedData };

      if (payload.priceAfterDiscount === "") {
        payload.priceAfterDiscount = null;
      }
      if (payload.priceBeforeDiscount === "") {
        payload.priceBeforeDiscount = null;
      }

      const res = await axios.put(`/products/${productId}`, payload);

      set((state) => ({
        products: state.products.map((p) =>
          p._id === productId ? res.data : p
        ),
        loading: false,
      }));
    } catch (error) {
      set({ loading: false });
    }
  },

  deleteProduct: async (productId) => {
    set({ loading: true });
    try {
      await axios.delete(`/products/${productId}`);
      set((state) => ({
        products: state.products.filter((product) => product._id !== productId),
        loading: false,
      }));
    } catch (error) {
      set({ loading: false });
    }
  },

  toggleFeaturedProduct: async (productId) => {
    set({ loading: true });
    try {
      const response = await axios.patch(`/products/${productId}/toggle-featured`);
      set((state) => ({
        products: state.products.map((product) =>
          product._id === productId
            ? { ...product, isFeatured: response.data.isFeatured }
            : product
        ),
        loading: false,
      }));
    } catch (error) {
      set({ loading: false });
    }
  }
}));