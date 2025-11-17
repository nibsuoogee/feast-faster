import { Order, Restaurant } from "@/types/restaurant";
import { orders, restaurants } from "@/data/restaurantMockData";

/**
 * Order service for restaurant dashboard
 * Uses mock data (cached automatically by JavaScript module system)
 */
export const orderService = {
  /**
   * Get all restaurants
   */
  getRestaurants: async (): Promise<Restaurant[]> => {
    return restaurants;
  },

  /**
   * Get orders for a specific restaurant
   */
  getOrdersByRestaurant: async (restaurantId: string): Promise<Order[]> => {
    return orders.filter(order => order.restaurantId === restaurantId);
  },

  /**
   * Update order status
   * Modifies the mock data in place (persists across calls due to module caching)
   */
  updateOrderStatus: async (
    orderId: string,
    newStatus: 'cooking' | 'ready' | 'picked_up'
  ): Promise<boolean> => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      console.log(`Updated order ${orderId} to status ${newStatus}`);
      return true;
    }
    return false;
  },
};