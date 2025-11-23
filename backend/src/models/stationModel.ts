import { t } from "elysia";
import { chargerModel } from "./chargerModel";
import { restaurantModel, restaurantWithMenuModel } from "./restaurantModel";
import { sql } from "bun";

export const StationDTO = {
  getStation: async (station_id: number): Promise<StationModel> => {
    const [result] = await sql`
        SELECT name FROM stations
        WHERE station_id = ${station_id};
      `;
    return result;
  },
};

export const stationModel = t.Object({
  station_id: t.Number(),
  name: t.String(),
  address: t.String(),
  restaurants: t.Array(restaurantModel),
  chargers: t.Array(chargerModel),
  travel_time_min: t.Number(),
  distance_km: t.Number(),
  soc_at_arrival: t.Number(),
  estimate_charging_time_min: t.Number(),
});
export type StationModel = typeof stationModel.static;

export const stationWithMenusModel = t.Object({
  station_id: t.Number(),
  name: t.String(),
  address: t.String(),
  restaurants: t.Array(restaurantWithMenuModel),
  chargers: t.Array(chargerModel),
  travel_time_min: t.Number(),
  distance_km: t.Number(),
  soc_at_arrival: t.Number(),
  estimate_charging_time_min: t.Number(),
});
export type StationWithMenusModel = typeof stationWithMenusModel.static;
