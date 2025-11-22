import { t } from "elysia";
import { sql } from "bun";

export const foodCategoryEnum = t.UnionEnum(["Mains", "Snacks", "Beverages"]);
export type FoodCategoryEnum = typeof foodCategoryEnum.static;

export const MenuItemsDTO = {
  getMenuItems: async (restaurant_id: number) => {
    const result = await sql`
      SELECT * FROM menu_items
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
  category: foodCategoryEnum,
});

export type MenuItem = typeof menuItemModel.static;
