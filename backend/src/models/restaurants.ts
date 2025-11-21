import { t } from "elysia";
import { sql } from "bun";

export const RestaurantsDTO = {
  getAll: async () => {
    const result = await sql`
      SELECT 
        restaurant_id,
        station_id,
        name,
        address,
        cuisines,
        location
      FROM restaurants
      ORDER BY restaurant_id ASC;
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
  location: t.Any(), // geography column
});

export type Restaurant = typeof restaurantModel.static;
