import { t } from "elysia";
import { sql } from "bun";

export const RestaurantListDTO = {
  getAll: async () => {
    const rows = await sql`
      SELECT 
        restaurant_id,
        station_id,
        name,
        address,
        cuisines,
        ST_X(location) AS lng,
        ST_Y(location) AS lat
      FROM restaurants
      ORDER BY restaurant_id ASC;
    `;

    return rows.map((row: any) => ({
      ...row,
      location: [row.lng, row.lat], 
    }));
  },
};


export const restaurantListModel = t.Object({
  restaurant_id: t.Number(),
  station_id: t.Number(),
  name: t.String(),
  address: t.String(),
  cuisines: t.Array(t.String()),
  location: t.Tuple([t.Number(), t.Number()]), 
});

export type RestaurantListItem = typeof restaurantListModel.static;
