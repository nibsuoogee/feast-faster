import { sql } from "bun";
import { t } from "elysia";
import { Reservation } from "./reservationModel";

export const ReservationDTO = {
  updateCharging: async (
    charger_id: number,
    chargingData: ChargingUpdateModel
  ): Promise<Reservation> => {
    const [updatedReservation] = await sql`
      UPDATE reservations
      SET ${sql(chargingData)}
      WHERE charger_id = ${charger_id}
        AND reservation_start <= NOW()
        AND reservation_end >= NOW()
      RETURNING *
    `;

    // If nothing was updated (no active reservation), return null
    return updatedReservation ?? null;
  },
};

export const chargingModel = t.Object({
  charger_id: t.Number(),
  current_soc: t.Number(),
  cumulative_price_of_charge: t.Number(),
  cumulative_power: t.Number(),
});
export type ChargingModel = typeof chargingModel.static;

export const chargingUpdateModel = t.Object({
  current_soc: t.Number(),
  cumulative_price_of_charge: t.Number(),
  cumulative_power: t.Number(),
});
export type ChargingUpdateModel = typeof chargingUpdateModel.static;
