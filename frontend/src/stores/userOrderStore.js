// stores/useOrderStore.js
import { create } from "zustand";
import axios from "axios";

export const useOrderStore = create((set) => ({
  orders: [],
  
  fetchOrders: async () => {
    try {
      const res = await axios.get("/api/orders");
      set({ orders: res.data });
    } catch (error) {
      console.error("Failed to fetch orders", error);
    }
  },
  
  deleteOrder: async (id) => {
    try {
      await axios.delete(`/api/orders/${id}`);
      set((state) => ({
        orders: state.orders.filter((order) => order._id !== id),
      }));
    } catch (error) {
      console.error("Failed to delete order", error);
    }
  },

toggleOrderConfirmation: async (orderIds) => {
  try {
    const res = await axios.patch("/api/orders/toggle-confirm", { orderIds });
    
    // تحديث الحالة المحلية بشكل صحيح
    set((state) => ({
      orders: state.orders.map((order) => 
        orderIds.includes(order._id) 
          ? { ...order, isConfirmed: !order.isConfirmed } // تغيير هنا
          : order
      ),
    }));
    
    return res.data;
  } catch (error) {
    console.error("Failed to toggle order confirmation", error);
    throw error;
  }
},

updateDeliveryPhone: async (orderId, deliveryPhone) => {
  try {
    const res = await axios.put(`/api/orders/${orderId}`, { deliveryPhone });
    const updatedOrder = res.data;

    set((state) => ({
      orders: state.orders.map((order) =>
        order._id === orderId? {...order, deliveryPhone: updatedOrder.deliveryPhone }: order
      ),
    }));

    return updatedOrder;
  } catch (error) {
    console.error("Failed to update delivery phone", error);
    throw error;
  }
},
}));