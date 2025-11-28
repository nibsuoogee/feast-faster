import { sql } from "bun";
import { t } from "elysia";

export const foodStatusEnum = t.UnionEnum([
  "pending",
  "cooking",
  "ready",
  "picked_up",
]);
export type FoodStatus = typeof foodStatusEnum.static;

export const OrderDTO = {
  getOrder: async (order_id: number) => {
    const [result] = await sql`
      SELECT * FROM orders
      WHERE order_id = ${order_id};
    `;
    return result;
  },
  createOrder: async (order: OrderModelForCreation): Promise<Order> => {
    const [newOrder] = await sql`
      INSERT INTO orders ${sql(order)}
      RETURNING *
    `;
    return newOrder;
  },
  updateOrderStatus: async (
    order_id: number,
    food_status: FoodStatus
  ): Promise<Order | null> => {
    const [updatedOrder] = await sql`
      UPDATE orders
      SET food_status = ${food_status}
      WHERE order_id = ${order_id}
      RETURNING *
    `;
    return updatedOrder ?? null;
  },
  updateOrderETA: async (
    order_id: number,
    data: Partial<Order>
  ): Promise<Order | null> => {
    const [updatedOrder] = await sql`
      UPDATE orders
      SET ${sql(data)}
      WHERE order_id = ${order_id}
      RETURNING *
    `;
    return updatedOrder ?? null;
  },
};

export const orderModel = t.Object({
  order_id: t.Number(),
  customer_id: t.Number(),
  restaurant_id: t.Number(),
  total_price: t.Number(),
  created_at: t.Date(),
  customer_eta: t.Date(),
  food_status: foodStatusEnum,
  start_cooking_time: t.Date(),
});
export type Order = typeof orderModel.static;

// order creation

export const orderModelForCreation = t.Object({
  customer_id: t.Number(),
  restaurant_id: t.Number(),
  total_price: t.Number(),
  customer_eta: t.Date(),
  start_cooking_time: t.Date(),
});
export type OrderModelForCreation = typeof orderModelForCreation.static;

export const orderUpdateStatusBody = t.Object({
  order_id: t.Number(),
  food_status: foodStatusEnum,
});

export type OrderUpdateStatusBody = typeof orderUpdateStatusBody.static;
