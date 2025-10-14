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

  fetchAllProducts: async (page = 1, limit = 10) => {
    set({ loading: true });
    try {
      // 🔥 استخدم '/products' بدون /api
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

  fetchFeaturedProducts: async () => {
    set({ loading: true });
    try {
      // 🔥 استخدم '/products/featured' بدون /api
      const response = await axios.get("/products/featured");
      set({ 
        featuredProducts: Array.isArray(response.data) ? response.data : [],
        loading: false 
      });
    } catch (error) {
      console.error("Fetch featured products error:", error);
      set({ 
        featuredProducts: [],
        loading: false 
      });
    }
  },

  fetchProductsByCategory: async (category) => {
    set({ loading: true });
    try {
      // 🔥 استخدم '/products/category/' بدون /api
      const response = await axios.get(`/products/category/${category}`);
      set({ products: response.data.products || [], loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error("Failed to fetch products by category");
    }
  },

  fetchProductById: async (productId) => {
    set({ loading: true });
    try {
      // 🔥 استخدم '/products/' بدون /api
      const response = await axios.get(`/products/${productId}`);
      set({ 
        products: [response.data], 
        loading: false 
      });
      return response.data;
    } catch (error) {
      set({ loading: false });
      toast.error("Failed to fetch product");
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
      
      // 🔥 استخدم '/products' بدون /api
      const res = await axios.post("/products", payload);
      set((state) => ({
        products: [...state.products, res.data],
        loading: false,
      }));
      toast.success("Product created successfully");
      return res.data;
    } catch (error) {
      console.error("Create product error:", error);
      const errorMsg = error.response?.data?.message || "Failed to create product";
      toast.error(errorMsg);
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

      // 🔥 استخدم '/products/' بدون /api
      const res = await axios.put(`/products/${productId}`, payload);

      set((state) => ({
        products: state.products.map((p) =>
          p._id === productId ? res.data : p
        ),
        loading: false,
      }));
      toast.success("Product updated successfully");
    } catch (error) {
      toast.error("Failed to update product");
      set({ loading: false });
    }
  },

  deleteProduct: async (productId) => {
    set({ loading: true });
    try {
      // 🔥 استخدم '/products/' بدون /api
      await axios.delete(`/products/${productId}`);
      set((state) => ({
        products: state.products.filter((product) => product._id !== productId),
        loading: false,
      }));
      toast.success("Product deleted successfully");
    } catch (error) {
      set({ loading: false });
      toast.error("Failed to delete product");
    }
  },

  toggleFeaturedProduct: async (productId) => {
    set({ loading: true });
    try {
      // 🔥 استخدم '/products/' بدون /api
      const response = await axios.patch(`/products/${productId}/toggle-featured`);
      set((state) => ({
        products: state.products.map((product) =>
          product._id === productId
            ? { ...product, isFeatured: response.data.isFeatured }
            : product
        ),
        loading: false,
      }));
      toast.success("Product featured status updated");
    } catch (error) {
      set({ loading: false });
      toast.error("Failed to update product");
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

      const res = await axios.put(`/api/products/${productId}`, payload);

      set((state) => ({
        products: state.products.map((p) =>
          p._id === productId ? res.data : p
        ),
        loading: false,
      }));
      toast.success("Product updated successfully");
    } catch (error) {
      toast.error("Failed to update product");
      set({ loading: false });
    }
  },
}));