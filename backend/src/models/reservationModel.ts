import { t } from "elysia";
import { sql } from "bun";

export const reservationModel = t.Object({
  reservation_id: t.Number(),
  order_id: t.Number(),
  charger_id: t.Number(),
  created_at: t.Date(),
  reservation_start: t.Date(),
  reservation_end: t.Date(),
  time_of_payment: t.Nullable(t.Date()),
  current_soc: t.Nullable(t.Number()),
  cumulative_price_of_charge: t.Nullable(t.Number()),
  cumulative_power: t.Nullable(t.Number()),
});
export type Reservation = typeof reservationModel.static;

// reservation creation

export const reservationForCreation = t.Object({
  order_id: t.Number(),
  charger_id: t.Number(),
  created_at: t.Date(),
  reservation_start: t.Date(),
  reservation_end: t.Date(),
  time_of_payment: t.Optional(t.Date()),
  current_soc: t.Nullable(t.Number()),
  cumulative_price_of_charge: t.Nullable(t.Number()),
});
export type ReservationForCreation = typeof reservationForCreation.static;

// reservation DTO

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
};
