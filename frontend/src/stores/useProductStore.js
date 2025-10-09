import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";
export const useProductStore = create((set) => ({
  products: [],
  featuredProducts: [],
  loading: false,
  currentPage: 1,
  totalPages: 1,
  totalProducts: 0,

  setProducts: (products) => set({ products }),

  setPage: (page) => set({ currentPage: page }),

  // ✅ تعطيل/تفعيل التقييمات (أدمن فقط)
  toggleReviews: async (productId) => {
    set({ loading: true });
    try {
      const res = await axios.put(`/reviews/${productId}/toggle-reviews`);
      set((prev) => ({
        products: prev.products.map((p) =>
          p._id === productId ? { ...p, reviewsEnabled: res.data.reviewsEnabled } : p
        ),
        loading: false,
      }));
    } catch (error) {
      set({ loading: false });
    }
  },

  // ✅ حذف جميع التقييمات (أدمن فقط)
  deleteAllReviews: async (productId) => {
    set({ loading: true });
    try {
      await axios.delete(`/reviews/${productId}/delete-reviews`);
      set((prev) => ({
        products: prev.products.map((p) =>
          p._id === productId ? { ...p, numReviews: 0, averageRating: 0 } : p
        ),
        loading: false,
      }));
    } catch (error) {
      set({ loading: false });
    }
  },
deleteReviewById: async (productId, reviewId) => {
  set({ loading: true });
  try {
    await axios.delete(`/reviews/${productId}/review/${reviewId}`);
    // حدث المنتج في الـ state
    set((prev) => ({
      products: prev.products.map((p) =>
        p._id === productId
          ? {
              ...p,
              numReviews: p.numReviews > 0 ? p.numReviews - 1 : 0,
            }
          : p
      ),
      loading: false,
    }));
  } catch (error) {
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
		const res = await axios.post("/products", payload);
		set((prevState) => ({
			products: [...prevState.products, res.data],
			loading: false,
		}));
	} catch (error) {
		console.error("Create product error:", error.response?.data || error.message);
		toast.error(error.response?.data?.error || "Failed to create product");
		set({ loading: false });
	}
	},

	fetchAllProducts: async (page = 1, limit = 10) => {
		set({ loading: true });
		try {
			const response = await axios.get(`/products?page=${page}&limit=${limit}`);
			set({
				products: response.data.products,
				currentPage: response.data.currentPage,
				totalPages: response.data.totalPages,
				totalProducts: response.data.totalProducts,
				loading: false,
			});
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.error || "Failed to fetch products");
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
