import { t } from "elysia";
import { sql } from "bun";

export const MenuItemsDTO = {
  getMenuItems: async (restaurant_id: number) => {
    const result = await sql`
      SELECT 
        menu_item_id, 
        name, 
        details, 
        price, 
        minutes_to_prepare, 
        availability
      FROM menu_items
      WHERE restaurant_id = ${restaurant_id};
    `;
    return result;
  },
};

export const menuItemModel = t.Object({
  menu_item_id: t.Number(),
  name: t.String(),
  details: t.String(),
  price: t.Number(),
  minutes_to_prepare: t.Number(),
  availability: t.String(),
});

export type MenuItem = typeof menuItemModel.static;
