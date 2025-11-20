import { sql } from "bun";
import { t } from "elysia";
import { Reservation } from "./reservationModel";

export const ChargingDTO = {
  updateCharging: async (
    charger_id: number,
    chargingData: ChargingUpdateModel
  ): Promise<Reservation | null> => {
    const [updatedReservation] = await sql`
      UPDATE reservations
      SET ${sql(chargingData)}
      WHERE charger_id = ${charger_id}
        AND reservation_start <= NOW()
        AND reservation_end >= NOW()
      RETURNING *
    `;

    return updatedReservation ?? null;
  },
  getUserIdByChargerId: async (charger_id: number): Promise<number | null> => {
    const [reservation] = await sql`
    SELECT o.customer_id
    FROM reservations r
    JOIN orders o ON r.order_id = o.order_id
    WHERE r.charger_id = ${charger_id}
      AND r.reservation_start <= NOW()
      AND r.reservation_end >= NOW()
    LIMIT 1
  `;

    return reservation?.customer_id ?? null;
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
  status: t.String(),
  type: t.String(),
  max_power: t.Number(),
});
export type ChargerModel = typeof chargerModel.static;
