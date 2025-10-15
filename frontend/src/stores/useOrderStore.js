// stores/useOrderStore.js - الإصدار المصحح
import { create } from "zustand";
import axios from "axios";
import { toast } from "react-hot-toast";

export const useOrderStore = create((set) => ({
  orders: [],
  loading: false,
  
  fetchOrders: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/api/orders");
      set({ orders: res.data || [], loading: false });
    } catch (error) {
      console.error("Failed to fetch orders", error);
      toast.error("Failed to load orders");
      set({ loading: false });
    }
  },
  
  deleteOrder: async (id) => {
    try {
      await axios.delete(`/api/orders/${id}`);
      set((state) => ({
        orders: state.orders.filter((order) => order._id !== id),
      }));
      toast.success("Order deleted successfully");
    } catch (error) {
      console.error("Failed to delete order", error);
      toast.error("Failed to delete order");
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
      toast.error("Failed to update order status");
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

      toast.success("Delivery phone updated");
      return res.data;
    } catch (error) {
      console.error("Failed to update delivery phone", error);
      toast.error("Failed to update delivery phone");
      throw error;
    }
  },
}));