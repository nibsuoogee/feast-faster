import { t } from "elysia";
import { stationModel } from "./stationModel";
import { PROCESSOR_URL } from "../lib/urls";
import { sql } from "bun";

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
  /**
   * Returns charger_ids for a given station that do NOT have
   * any overlapping reservations in the requested time range.
   */
  getAvailableChargers: async (
    station_id: number,
    requested_start: Date,
    requested_end: Date
  ): Promise<number[]> => {
    const result: { charger_id: number }[] = await sql`
      SELECT c.charger_id
      FROM chargers c
      WHERE c.station_id = ${station_id}
        AND NOT EXISTS (
          SELECT 1
          FROM reservations r
          WHERE r.charger_id = c.charger_id
            -- Overlap condition:
            AND r.reservation_start < ${requested_end}
            AND r.reservation_end   > ${requested_start}
        );
    `;

    // result is rows like: [{ charger_id: 3 }, { charger_id: 7 }]
    return result.map((row) => row.charger_id);
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

export const stationsModel = t.Array(stationModel);
export type StationsModel = typeof stationsModel.static;
