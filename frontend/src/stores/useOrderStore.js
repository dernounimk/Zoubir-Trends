// stores/useOrderStore.js
import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useOrderStore = create((set, get) => ({
  orders: [],
  loading: false,
  
  fetchOrders: async () => {
    set({ loading: true });
    try {
      console.log("🔄 جلب الطلبات من API...");
      const res = await axios.get("/api/orders");
      console.log("📦 استجابة API:", res.data);
      set({ orders: res.data || [], loading: false });
      console.log("✅ تم تحميل الطلبات بنجاح:", res.data?.length || 0);
    } catch (error) {
      console.error("❌ فشل في جلب الطلبات:", error);
      toast.error("فشل في تحميل الطلبات");
      set({ loading: false });
    }
  },
  
  deleteOrder: async (id) => {
    try {
      await axios.delete(`/api/orders/${id}`);
      set((state) => ({
        orders: state.orders.filter((order) => order._id !== id),
      }));
      toast.success("تم حذف الطلب بنجاح");
    } catch (error) {
      console.error("Failed to delete order", error);
      toast.error("فشل في حذف الطلب");
      throw error;
    }
  },

  toggleOrderConfirmation: async (orderIds) => {
    try {
      const res = await axios.patch("/api/orders/toggle-confirm", { orderIds });
      
      set((state) => ({
        orders: state.orders.map((order) => 
          orderIds.includes(order._id) 
            ? { ...order, isConfirmed: res.data.newStatus } 
            : order
        ),
      }));
      
      toast.success(res.data.message);
      return res.data;
    } catch (error) {
      console.error("Failed to toggle order confirmation", error);
      toast.error("فشل في تحديث حالة الطلب");
      throw error;
    }
  },

  updateDeliveryPhone: async (orderId, deliveryPhone) => {
    try {
      const res = await axios.put(`/api/orders/${orderId}`, { deliveryPhone });
      
      set((state) => ({
        orders: state.orders.map((order) =>
          order._id === orderId 
            ? { ...order, deliveryPhone } 
            : order
        ),
      }));

      toast.success("تم تحديث رقم الهاتف");
      return res.data;
    } catch (error) {
      console.error("Failed to update delivery phone", error);
      toast.error("فشل في تحديث رقم الهاتف");
      throw error;
    }
  },
}));