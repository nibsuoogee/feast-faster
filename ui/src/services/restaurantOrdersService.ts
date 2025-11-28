import axios from "axios";
import { handleApiRequest } from "@/lib/requests";
import { BACKEND_URL } from "@/lib/urls";
import { Order, OrderItem, Restaurant } from "@/types/restaurant";
import {
  Order as BackendOrder,
  RestaurantListItem,
  RestaurantOrder as BackendRestaurantOrder,
} from "@types";

const formatOrderNumber = (orderId: number): string =>
  `ORD-${orderId.toString().padStart(4, "0")}`;

const mapOrderItems = (items: BackendRestaurantOrder["items"]): OrderItem[] => {
  return items.map((item) => ({
    name: item.name,
    quantity: item.quantity,
    preparationTime: item.minutes_to_prepare,
  }));
};

const mapOrdersToUi = (orders: BackendRestaurantOrder[]): Order[] =>
  orders.map(({ order, items, reservation }) => {
    const etaSource = order.customer_eta ?? order.created_at;

    return {
      id: String(order.order_id),
      orderNumber: formatOrderNumber(order.order_id),
      restaurant_id: String(order.restaurant_id),
      status: order.food_status,
      customerETA: new Date(etaSource),
      items: mapOrderItems(items),
      chargePercentage: reservation?.current_soc ?? 0,
      start_cooking_order: order.start_cooking_time,
    };
  });

/**
 * Order service for restaurant dashboard
 * Bridges backend DTOs to the lightweight UI types.
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
    const data = await handleApiRequest<BackendRestaurantOrder[]>(() =>
      axios.get(`${BACKEND_URL}/restaurants/${restaurant_id}/orders`)
    );
    if (!data) return [];
    return mapOrdersToUi(data);
  },

  /**
   * Update order status
   */
  updateOrderStatus: async (
    orderId: string,
    newStatus: "cooking" | "ready" | "picked_up"
  ): Promise<boolean> => {
    const response = await handleApiRequest<BackendOrder>(() =>
      axios.patch(`${BACKEND_URL}/order-status`, {
        order_id: Number(orderId),
        food_status: newStatus,
      })
    );
    return Boolean(response);
  },
};
