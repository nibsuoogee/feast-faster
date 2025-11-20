import { t } from "elysia";
import { chargerModel } from "./chargerModel";
import { restaurantModel } from "./restaurantModel";
import { PROCESSOR_URL } from "../lib/urls";

export const StationsDTO = {
  getFilteredStations: async (
    body: StationsFilterModel
  ): Promise<StationsModel | null> => {
    try {
      const response = await fetch(
        `${PROCESSOR_URL}/api/get-filtered-stations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        console.error("Processor error: ", await response.text());
        return null;
      }

      const data: StationsModel = await response.json();
      return data;
    } catch (error) {
      console.error("Error contacting processor: ", error);
      return null;
    }
  },
};

export const stationsFilterModel = t.Object({
  current_location: t.Tuple([t.Number(), t.Number()]),
  destination: t.Tuple([t.Number(), t.Number()]),
  ev_model: t.String(),
  current_car_range: t.Number(),
  current_soc: t.Number(),
  desired_soc: t.Number(),
  connector_type: t.String(),
  cuisines: t.Array(t.String()),
});
export type StationsFilterModel = typeof stationsFilterModel.static;

export const stationsModel = t.Array(
  t.Object({
    station_id: t.Number(),
    name: t.String(),
    address: t.String(),
    restaurants: t.Array(restaurantModel),
    chargers: t.Array(chargerModel),
    travel_time_min: t.Number(),
    distance_km: t.Number(),
    soc_at_arrival: t.Number(),
    estimate_charging_time_min: t.Number(),
  })
);
export type StationsModel = typeof stationsModel.static;
