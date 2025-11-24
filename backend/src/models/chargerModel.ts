import { sql } from "bun";
import { t } from "elysia";
import { Reservation } from "./reservationModel";

export const ChargingDTO = {
  updateCharging: async (
    charger_id: number,
    user_id: number,
    chargingData: ChargingUpdateModel
  ): Promise<Reservation | null> => {
    const [updatedReservation] = await sql`
      UPDATE reservations
      SET ${sql(chargingData)}
      WHERE charger_id = ${charger_id}
      AND order_id IN (
        SELECT order_id FROM orders WHERE customer_id = ${user_id}
      )
      RETURNING *
    `;

    return updatedReservation ?? null;
  },
  updateChargingStartTime: async (
    reservation_id: number,
    charge_start_time: Date
  ): Promise<Reservation | null> => {
    const [updatedReservation] = await sql`
      UPDATE reservations SET ${sql({ charge_start_time: charge_start_time })}
      WHERE reservation_id = ${reservation_id} RETURNING *
    `;

    return updatedReservation ?? null;
  },
  updateReservationTimeOfPayment: async (
    reservation_id: number,
    time_of_payment: Date
  ): Promise<Reservation | null> => {
    const [updatedReservation] = await sql`
        UPDATE reservations
        SET time_of_payment = ${time_of_payment}
        WHERE reservation_id = ${reservation_id}
        RETURNING *
      `;
    return updatedReservation ?? null;
  },
};

export const chargingModel = t.Object({
  charger_id: t.Number(),
  user_id: t.Number(),
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

export const chargerModel = t.Object({
  charger_id: t.Number(),
  type: t.String(),
  max_power: t.Number(),
});
export type ChargerModel = typeof chargerModel.static;
