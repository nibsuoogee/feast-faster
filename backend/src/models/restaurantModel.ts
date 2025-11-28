import { sql } from "bun";
import { t } from "elysia";
import { menuItemModel } from "./menuItemModel";
import {
  orderItemForRestaurant,
  OrderItemForRestaurant,
} from "./orderItemModel";
import { Order, orderModel } from "./orderModel";
import { Reservation, reservationModel } from "./reservationModel";

// Response type
export const restaurantOrdersModel = t.Object({
  order: orderModel,
  items: t.Array(orderItemForRestaurant),
  reservation: reservationModel,
});

export type RestaurantOrder = typeof restaurantOrdersModel.static;

export const RestaurantDTO = {
  getOrdersWithDetails: async (
    restaurant_id: number
  ): Promise<RestaurantOrder[]> => {
    const orders: Order[] = await sql<Order[]>`
      SELECT * FROM orders
      WHERE restaurant_id = ${restaurant_id}
      ORDER BY created_at DESC
    `;

    const results: RestaurantOrder[] = [];

    for (const order of orders) {
      // Fetch order items with menu details
      const items: OrderItemForRestaurant[] = await sql<
        OrderItemForRestaurant[]
      >`
        SELECT oi.*, mi.name, mi.details, mi.price, mi.minutes_to_prepare
        FROM order_items oi
        JOIN menu_items mi ON oi.menu_item_id = mi.menu_item_id
        WHERE oi.order_id = ${order.order_id}
      `;

      // Fetch reservation
      const [reservation] = await sql<Reservation[]>`
        SELECT * FROM reservations
        WHERE order_id = ${order.order_id}
      `;

      results.push({
        order,
        items,
        reservation: reservation ?? null,
      });
    }

    return results;
  },
  getRestaurant: async (restaurant_id: number): Promise<RestaurantModel> => {
    const [result] = await sql`
      SELECT * FROM restaurants
      WHERE restaurant_id = ${restaurant_id};
    `;
    return result;
  },
};

export const restaurantModel = t.Object({
  restaurant_id: t.Number(),
  station_id: t.Number(),
  name: t.String(),
  address: t.String(),
  cuisines: t.Array(t.String()),
});
export type RestaurantModel = typeof restaurantModel.static;

export const restaurantWithMenuModel = t.Object({
  restaurant_id: t.Number(),
  station_id: t.Number(),
  name: t.String(),
  address: t.String(),
  cuisines: t.Array(t.String()),
  menu: t.Array(menuItemModel),
});
export type RestaurantWithMenuModel = typeof restaurantWithMenuModel.static;
