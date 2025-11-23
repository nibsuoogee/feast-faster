import { t } from "elysia";
import { sql } from "bun";

// order_item model

export const orderItemModel = t.Object({
  order_item_id: t.Number(),
  order_id: t.Number(),
  menu_item_id: t.Number(),
  created_at: t.Date(),
  name: t.String(),
  details: t.String(),
  price: t.Number(),
  quantity: t.Number(),
});
export type OrderItem = typeof orderItemModel.static;

// order_item creation

export const orderItemModelForCreation = t.Object({
  order_id: t.Number(),
  menu_item_id: t.Number(),
  name: t.String(),
  details: t.String(),
  price: t.Number(),
  quantity: t.Number(),
});
export type OrderItemForCreation = typeof orderItemModelForCreation.static;

// order_item DTO

export const OrderItemDTO = {
  createOrderItem: async (item: OrderItemForCreation): Promise<OrderItem> => {
    const [newItem] = await sql`
      INSERT INTO order_items ${sql(item)}
      RETURNING *
    `;
    return newItem;
  },
};
