import axios from "axios";
import { handleApiRequest } from "@/lib/requests";
import { BACKEND_URL } from "@/lib/urls";
import { Order, Restaurant } from "@/types/restaurant";
import { orders as mockOrders, restaurants as mockRestaurants } from "@/data/restaurantMockData";

export type OrderServiceResponse = {
  orders: Order[];
  usingMockData: boolean;
};

// Cache mock data to prevent timestamp regeneration on every call
let cachedMockOrders: Order[] | null = null;
let cachedMockRestaurants: Restaurant[] | null = null;

const getCachedMockOrders = (): Order[] => {
  if (!cachedMockOrders) {
    cachedMockOrders = mockOrders;
  }
  return cachedMockOrders;
};

const getCachedMockRestaurants = (): Restaurant[] => {
  if (!cachedMockRestaurants) {
    cachedMockRestaurants = mockRestaurants;
  }
  return cachedMockRestaurants;
};

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
      return data || getCachedMockRestaurants();
    } catch (error) {
      console.warn("Failed to fetch restaurants from API, using cached mock data", error);
      return getCachedMockRestaurants();
    }
  },

  /**
   * Get orders for a specific restaurant
   * Falls back to mock data if API is unavailable
   */
  getOrdersByRestaurant: async (restaurantId: string): Promise<OrderServiceResponse> => {
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
        const orders = data.map((order: any) => ({
          id: order.order_id?.toString() || order.id,
          orderNumber: order.order_number || `ORD-${order.order_id}`,
          restaurantId: order.restaurant_id?.toString() || order.restaurantId,
          status: order.food_status || order.status,
          customerETA: new Date(order.customer_eta || order.customerETA),
          items: order.items || [],
          chargePercentage: order.charge_percentage || order.chargePercentage,
        }));
        return { orders, usingMockData: false };
      }
      
      // Fallback to mock data (use cached version to prevent timestamp regeneration)
      console.warn("API returned invalid data, using cached mock data");
      return {
        orders: getCachedMockOrders().filter(order => order.restaurantId === restaurantId),
        usingMockData: true
      };
    } catch (error) {
      console.warn("Failed to fetch orders from API, using cached mock data", error);
      return {
        orders: getCachedMockOrders().filter(order => order.restaurantId === restaurantId),
        usingMockData: true
      };
    }
  },

  /**
   * Update order status
   * Falls back to updating cached mock data if API is unavailable
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
      
      if (data) {
        return true;
      }
      
      // API failed, update cached mock data directly
      if (cachedMockOrders) {
        const order = cachedMockOrders.find(o => o.id === orderId);
        if (order) {
          order.status = newStatus;
          console.log(`Updated cached mock order ${orderId} to status ${newStatus}`);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.warn("Failed to update order status via API, updating cached mock data", error);
      
      // Update cached mock data directly
      if (cachedMockOrders) {
        const order = cachedMockOrders.find(o => o.id === orderId);
        if (order) {
          order.status = newStatus;
          console.log(`Updated cached mock order ${orderId} to status ${newStatus}`);
          return true;
        }
      }
      
      return false;
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
