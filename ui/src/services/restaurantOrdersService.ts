import axios from "axios";
import { handleApiRequest } from "@/lib/requests";
import { BACKEND_URL } from "@/lib/urls";
import { Order, Restaurant } from "@/types/restaurant";
import { RestaurantListItem } from "@types";
import { orders } from "@/data/restaurantMockData";

/**
 * Order service for restaurant dashboard
 * Uses mock data (cached automatically by JavaScript module system)
 */
export const orderService = {
  /**
   * Get all restaurants
   */
  getRestaurants: async (): Promise<Restaurant[]> => {
    const data = await handleApiRequest<{ restaurants: RestaurantListItem[] }>(
      () => axios.get(`${BACKEND_URL}/restaurants`)
    );

    if (!data) return [];
    // Map backend response to dashboard type
    return data.restaurants.map((restaurant) => ({
      id: String(restaurant.restaurant_id),
      name: restaurant.name,
    }));
  },

  /**
   * Get orders for a specific restaurant
   */
  getOrdersByRestaurant: async (restaurant_id: string): Promise<Order[]> => {
    return orders.filter((order) => order.restaurant_id === restaurant_id);
  },

  /**
   * Update order status
   * Modifies the mock data in place (persists across calls due to module caching)
   */
  updateOrderStatus: async (
    orderId: string,
    newStatus: "cooking" | "ready" | "picked_up"
  ): Promise<boolean> => {
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      order.status = newStatus;
      console.log(`Updated order ${orderId} to status ${newStatus}`);
      return true;
    }
    return false;
  },
};
