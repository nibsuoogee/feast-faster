import axios from "axios";
import { handleApiRequest } from "@/lib/requests";
import { BACKEND_URL } from "@/lib/urls";
import { Order, Restaurant } from "@/types/restaurant";
import { orders as mockOrders, restaurants as mockRestaurants } from "@/data/restaurantMockData";

export const orderService = {
  /**
   * Get all restaurants
   * Falls back to mock data if API is unavailable
   */
  getRestaurants: async (): Promise<Restaurant[]> => {
    try {
      const data = await handleApiRequest<Restaurant[]>(() =>
        axios.get(`${BACKEND_URL}/restaurants`)
      );
      return data || mockRestaurants;
    } catch (error) {
      console.warn("Failed to fetch restaurants from API, using mock data", error);
      return mockRestaurants;
    }
  },

  /**
   * Get orders for a specific restaurant
   * Falls back to mock data if API is unavailable
   */
  getOrdersByRestaurant: async (restaurantId: string): Promise<Order[]> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await handleApiRequest<any[]>(() =>
        axios.get(`${BACKEND_URL}/orders`, {
          params: { restaurant_id: restaurantId }
        })
      );
      
      if (data && Array.isArray(data)) {
        // Map API response to Order type
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return data.map((order: any) => ({
          id: order.order_id?.toString() || order.id,
          orderNumber: order.order_number || `ORD-${order.order_id}`,
          restaurantId: order.restaurant_id?.toString() || order.restaurantId,
          status: order.food_status || order.status,
          customerETA: new Date(order.customer_eta || order.customerETA),
          items: order.items || [],
          chargePercentage: order.charge_percentage || order.chargePercentage,
        }));
      }
      
      // Fallback to mock data
      return mockOrders.filter(order => order.restaurantId === restaurantId);
    } catch (error) {
      console.warn("Failed to fetch orders from API, using mock data", error);
      return mockOrders.filter(order => order.restaurantId === restaurantId);
    }
  },

  /**
   * Update order status
   * Falls back to local state update if API is unavailable
   */
  updateOrderStatus: async (
    orderId: string,
    newStatus: 'ready' | 'picked_up'
  ): Promise<boolean> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await handleApiRequest<any>(() =>
        axios.patch(`${BACKEND_URL}/orders/${orderId}`, {
          food_status: newStatus
        })
      );
      
      return !!data;
    } catch (error) {
      console.warn("Failed to update order status via API", error);
      // Return true to allow local state update as fallback
      return true;
    }
  },

  /**
   * Subscribe to real-time order updates via SSE
   * Similar to notification service
   */
  subscribeToOrderUpdates: (
    restaurantId: string,
    _onUpdate: (order: Order) => void
  ) => {
    // TODO: Implement SSE subscription when backend is ready
    // For now, this is a placeholder
    console.log(`Subscribing to order updates for restaurant ${restaurantId}`);
    
    // Example implementation when backend SSE is ready:
    /*
    const token = localStorage.getItem("access_token");
    
    fetchEventSource(`${BACKEND_URL}/orders/subscribe?restaurant_id=${restaurantId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      onmessage(ev) {
        const order = JSON.parse(ev.data);
        _onUpdate(order);
      },
      onerror(err) {
        console.error("SSE error:", err);
      },
    });
    */
  },
};
