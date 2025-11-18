import { t } from "elysia";

export const restaurantModel = t.Object({
  restaurant_id: t.Number(),
  name: t.String(),
  address: t.String(),
  cuisines: t.Array(t.String()),
});
export type RestaurantModel = typeof restaurantModel.static;
