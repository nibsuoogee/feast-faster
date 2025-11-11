import { Elysia, t } from "elysia";
import { MenuItemsDTO, menuItemModel } from "../models/menu_items"; 
import { tryCatch } from "../utils/tryCatch";

export const menuItemsRouter = new Elysia({ prefix: "/menu-items" })
  .get(
    "/",
    async ({ query, status }) => {
      const restaurant_id = Number(query.restaurant_id);
      if (!restaurant_id || Number.isNaN(restaurant_id)) {
        return status(400, "restaurant_id is required and must be a number");
      }

      const [items, error] = await tryCatch(
        MenuItemsDTO.getMenuItems(restaurant_id),
        "getMenuItems"
      );

      if (error) return status(500, error.message);
      return { items };
    },
    {
      query: t.Object({
        restaurant_id: t.String(),
      }),
      response: {
        200: t.Object({
          items: t.Array(menuItemModel),
        }),
        400: t.String(),
        500: t.String(),
      },
    }
  );
