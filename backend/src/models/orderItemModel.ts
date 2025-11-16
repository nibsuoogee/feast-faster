import { t } from "elysia";
import { sql } from "bun";

/**
 * ORDER ITEM MODEL
 */
export const orderItemModel = t.Object({
  order_item_id: t.Number(),
  order_id: t.Number(),
  menu_item_id: t.Number(),
  name: t.String(),
  details: t.String(),
  price: t.Number(),
  created_at: t.Date(),
});
export type OrderItem = typeof orderItemModel.static;

/**
 * ORDER ITEM CREATION SHAPE
 */
export const orderItemModelForCreation = t.Object({
  order_id: t.Number(),
  menu_item_id: t.Number(),
  name: t.String(),
  details: t.String(),
  price: t.Number(),
});
export type OrderItemForCreation = typeof orderItemModelForCreation.static;

/**
 * ORDER ITEM DTO
 */
export const OrderItemDTO = {
  createOrderItem: async (
    item: OrderItemForCreation
  ): Promise<OrderItem> => {
    const [newItem] = await sql`
      INSERT INTO order_items ${sql(item)}
      RETURNING *
    `;
    return newItem;
  },

  getItemsByOrderId: async (order_id: number): Promise<OrderItem[]> => {
    const result = await sql`
      SELECT * FROM order_items WHERE order_id = ${order_id}
    `;
    return result;
  },
};
