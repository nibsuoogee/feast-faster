import { t } from "elysia";
import { sql } from "bun";

export const reservationModel = t.Object({
  reservation_id: t.Number(),
  order_id: t.Number(),
  charger_id: t.Number(),
  created_at: t.String(),
  reservation_start: t.String(),
  reservation_end: t.String(),
  time_of_payment: t.Nullable(t.String()),
  current_soc: t.Nullable(t.Number()),
  cumulative_price_of_charge: t.Nullable(t.Number()),
  cumulative_power: t.Nullable(t.Number()),
});
export type Reservation = typeof reservationModel.static;

/**
 * RESERVATION CREATION SHAPE
 */
export const reservationForCreation = t.Object({
  order_id: t.Number(),
  charger_id: t.Number(),
  reservation_start: t.Date(),
  reservation_end: t.Date(),
  time_of_payment: t.Optional(t.Date()),
  cumulative_price_of_charge: t.Nullable(t.Number()),
});
export type ReservationForCreation = typeof reservationForCreation.static;

/**
 * RESERVATION DTO
 */
export const ReservationDTO = {
  createReservation: async (
    reservation: ReservationForCreation
  ): Promise<Reservation> => {
    const [newReservation] = await sql`
      INSERT INTO reservations ${sql(reservation)}
      RETURNING *
    `;
    return newReservation;
  },

  getReservationByOrderId: async (
    order_id: number
  ): Promise<Reservation | null> => {
    const result = await sql`
      SELECT * FROM reservations WHERE order_id = ${order_id}
    `;
    return result[0] || null;
  },
};
