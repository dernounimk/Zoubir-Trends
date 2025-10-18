import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],
      shippingInfo: null,
      coupon: null,
      isCouponApplied: false,
      deliveryPrice: 0,
      subtotal: 0,
      total: 0,
      finalTotal: 0,

      calculateTotals: () => {
        const { cart, isCouponApplied, coupon, deliveryPrice } = get();

        const subtotal = cart.reduce(
          (acc, item) =>
            acc + (item.priceAfterDiscount ? item.priceAfterDiscount : item.priceBeforeDiscount) * item.quantity,
          0
        );

        let discount = 0;
        if (isCouponApplied && coupon) {
          discount = coupon.discountAmount;
        }

        const total = subtotal - discount;
        const finalTotal = total + deliveryPrice;

        set({ subtotal, total, finalTotal });
      },

      addToCart: (product) => {
        set((state) => {
          const existing = state.cart.find(
            (item) =>
              item._id === product._id &&
              item.selectedColor === product.selectedColor &&
              item.selectedSize === product.selectedSize
          );

          if (existing) {
            // إذا المنتج بنفس المواصفات موجود، زد الكمية
            return {
              cart: state.cart.map((item) =>
                item._id === product._id &&
                item.selectedColor === product.selectedColor &&
                item.selectedSize === product.selectedSize
                  ? { ...item, quantity: item.quantity + product.quantity }
                  : item
              ),
            };
          }

          // إذا المنتج مختلف أو غير موجود، أضفه كمنتج جديد
          return { cart: [...state.cart, { ...product, quantity: product.quantity }] };
      });

        get().calculateTotals();
      },

      updateQuantity: (id, selectedColor, selectedSize, quantity) => {
        const { cart } = get();
        const updatedCart = cart.map((item) =>
          item._id === id &&
          item.selectedColor === selectedColor &&
          item.selectedSize === selectedSize
            ? { ...item, quantity }
            : item
        );
        set({ cart: updatedCart });
        get().calculateTotals();
      },

      removeFromCart: (id, selectedColor, selectedSize) => {
        const { cart } = get();
        const newCart = cart.filter(
          (item) =>
            !(
              item._id === id &&
              item.selectedColor === selectedColor &&
              item.selectedSize === selectedSize
            )
        );
        set({ cart: newCart });
        get().calculateTotals();
      },

      setShippingInfo: (info) => set({ shippingInfo: info }),

      setDeliveryPrice: (price) => {
        set({ deliveryPrice: price });
        get().calculateTotals();
      },
// في useCartStore.js
applyCoupon: async (code) => {
  try {
    const response = await axios.post("/api/coupons/validate", { code });
    const coupon = response.data;
    
    // تأكد من أن الاستجابة تحتوي على البيانات المطلوبة
    if (coupon && coupon.code && coupon.discountAmount !== undefined) {
      set({ coupon, isCouponApplied: true });
      get().calculateTotals();
      return { success: true };
    } else {
      throw new Error("Invalid coupon response");
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || "Error validating coupon";
    toast.error(errorMessage);
    return { success: false, error: errorMessage };
  }
},

getMyCoupon: async () => {
  const { coupon, isCouponApplied } = get();

  if (coupon && isCouponApplied) {
    try {
      const response = await axios.post("/api/coupons/validate", { code: coupon.code }); // 🔥 أضف /api
      const validCoupon = response.data;
      set({ coupon: validCoupon, isCouponApplied: true });
      get().calculateTotals();
    } catch (err) {
      set({ coupon: null, isCouponApplied: false });
      get().calculateTotals();
    }
  }
},

      removeCoupon: () => {
        set({ coupon: null, isCouponApplied: false });
        get().calculateTotals();
      },

      clearCart: () => {
        set({ cart: [], shippingInfo: null, deliveryPrice: 0 });
        get().calculateTotals();
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        cart: state.cart,
        shippingInfo: state.shippingInfo,
        deliveryPrice: state.deliveryPrice,
        coupon: state.coupon,
        isCouponApplied: state.isCouponApplied,
        finalTotal: state.finalTotal,
      }),
    }
  )
)
