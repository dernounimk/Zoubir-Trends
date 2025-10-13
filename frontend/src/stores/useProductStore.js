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

  setProducts: (products) => set({ products }),
  setPage: (page) => set({ currentPage: page }),

  // ✅ تعطيل/تفعيل التقييمات
  toggleReviews: async (productId) => {
    set({ loading: true });
    try {
      const res = await axios.put(`/api/reviews/${productId}/toggle-reviews`);
      set((state) => ({
        products: state.products.map((p) =>
          p._id === productId ? { ...p, reviewsEnabled: res.data.reviewsEnabled } : p
        ),
      }));
      toast.success(`Reviews ${res.data.reviewsEnabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error("Toggle reviews error:", error);
      toast.error("Failed to update reviews settings");
    } finally {
      set({ loading: false });
    }
  },

  // ✅ حذف جميع التقييمات
  deleteAllReviews: async (productId) => {
    set({ loading: true });
    try {
      await axios.delete(`/api/reviews/${productId}/delete-reviews`);
      set((state) => ({
        products: state.products.map((p) =>
          p._id === productId ? { ...p, numReviews: 0, averageRating: 0 } : p
        ),
      }));
      toast.success("All reviews deleted");
    } catch (error) {
      console.error("Delete all reviews error:", error);
      toast.error("Failed to delete reviews");
    } finally {
      set({ loading: false });
    }
  },

  deleteReviewById: async (productId, reviewId) => {
    set({ loading: true });
    try {
      await axios.delete(`/api/reviews/${productId}/review/${reviewId}`);
      set((state) => ({
        products: state.products.map((p) =>
          p._id === productId
            ? {
                ...p,
                numReviews: Math.max(0, p.numReviews - 1),
                // إعادة حساب التقييم يحتاج fetch جديد
              }
            : p
        ),
      }));
      toast.success("Review deleted");
    } catch (error) {
      console.error("Delete review error:", error);
      toast.error("Failed to delete review");
    } finally {
      set({ loading: false });
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
      
      const res = await axios.post("/api/products", payload);
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

  fetchAllProducts: async (page = 1, limit = 10) => {
    set({ loading: true });
    try {
      const response = await axios.get(`/api/products?page=${page}&limit=${limit}`);
      const data = response.data;
      
      set({
        products: data.products || [],
        currentPage: data.currentPage || 1,
        totalPages: data.totalPages || 1,
        totalProducts: data.totalProducts || 0,
        loading: false,
      });
    } catch (error) {
      console.error("Fetch products error:", error);
      toast.error("Failed to fetch products");
      set({ loading: false });
    }
  },

	fetchProductsByCategory: async (category) => {
		set({ loading: true });
		try {
			const response = await axios.get(`/products/category/${category}`);
			set({ products: response.data.products, loading: false });
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.error || "Failed to fetch products");
		}
	},

// تأكد من أن دالة fetchProductById تعيد المنتج مع الألوان كمصفوفة IDs
	fetchProductById: async (productId) => {
	set({ loading: true });
	try {
		const response = await axios.get(`/products/${productId}`);
		set({ 
		products: [response.data], 
		loading: false 
		});
		return response.data; // يجب أن تكون colors هنا كمصفوفة من IDs
	} catch (error) {
		set({ loading: false });
		toast.error(error.response?.data?.error || "Failed to fetch product");
		return null;
	}
	},

	deleteProduct: async (productId) => {
		set({ loading: true });
		try {
			await axios.delete(`/products/${productId}`);
			set((prevProducts) => ({
				products: prevProducts.products.filter((product) => product._id !== productId),
				loading: false,
			}));
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.error || "Failed to delete product");
		}
	},

	toggleFeaturedProduct: async (productId) => {
		set({ loading: true });
		try {
			const response = await axios.patch(`/products/${productId}`);
			set((prevProducts) => ({
				products: prevProducts.products.map((product) =>
					product._id === productId
						? { ...product, isFeatured: response.data.isFeatured }
						: product
				),
				loading: false,
			}));
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.error || "Failed to update product");
		}
	},

	fetchFeaturedProducts: async () => {
	set({ loading: true });
	try {
		const response = await axios.get("/products/featured");
		set({ 
		featuredProducts: response.data,
		loading: false 
		});
	} catch (error) {
		set({ loading: false });
	}
	},

	updateProduct: async (productId, updatedData) => {
	set({ loading: true });
	try {
		const payload = { ...updatedData };

		// بدل حذف الحقل، اتركه null كما هو
		if (payload.priceAfterDiscount === "") {
		payload.priceAfterDiscount = null;
		}
		if (payload.priceBeforeDiscount === "") {
		payload.priceBeforeDiscount = null;
		}

		const res = await axios.put(`/products/${productId}`, payload);

		set((prev) => ({
		products: prev.products.map((p) =>
			p._id === productId ? res.data : p
		),
		loading: false,
		}));
	} catch (error) {
		toast.error(error.response?.data?.error || "فشل تحديث المنتج");
		set({ loading: false });
	}
	},
}));