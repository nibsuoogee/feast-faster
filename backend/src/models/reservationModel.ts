import { t } from "elysia";
import { sql } from "bun";

export const reservationModel = t.Object({
  reservation_id: t.Number(),
  order_id: t.Number(),
  charger_id: t.Number(),
  created_at: t.Date(),
  reservation_start: t.Date(),
  reservation_end: t.Date(),
  cumulative_power: t.Nullable(t.Number()),
  cumulative_price_of_charge: t.Nullable(t.Number()),
  current_soc: t.Nullable(t.Number()),
  charge_start_time: t.Nullable(t.Date()),
});
export type Reservation = typeof reservationModel.static;

// reservation creation

export const reservationForCreation = t.Object({
  order_id: t.Number(),
  charger_id: t.Number(),
  reservation_start: t.Date(),
  reservation_end: t.Date(),
});
export type ReservationForCreation = typeof reservationForCreation.static;

// reservation DTO

export const ReservationDTO = {
  getReservationById: async (reservation_id: number): Promise<Reservation> => {
    const result =
      await sql`SELECT * FROM reservations WHERE reservation_id = ${reservation_id}`;
    return result[0];
  },
  createReservation: async (
    reservation: ReservationForCreation
  ): Promise<Reservation> => {
    const [newReservation] = await sql`
      INSERT INTO reservations ${sql(reservation)}
      RETURNING *
    `;
    return newReservation;
  },
  /**
   * Checks whether a given charger has a reservation within 10 minutes
   * of the given reservation end time.
   */
  hasConflictingReservation: async (
    charger_id: number,
    reservation_end: Date,
    postpone_seconds: number
  ): Promise<boolean> => {
    const limitTime = new Date(reservation_end.getTime() + postpone_seconds);

    const result = await sql`
      SELECT 1
      FROM reservations
      WHERE charger_id = ${charger_id}
        AND reservation_start >= ${reservation_end}
        AND reservation_start <= ${limitTime}
      LIMIT 1
    `;

    return result.length > 0;
  },
  /**
   * Shifts both reservation_start and reservation_end forward by a given number of minutes.
   * Returns the updated reservation, or null if not found.
   */
  shiftReservation: async (
    reservation_id: number,
    minutes: number
  ): Promise<Reservation | null> => {
    const ms = minutes * 60 * 1000; // Convert minutes → milliseconds

    // First retrieve existing reservation
    const reservation =
      await sql`SELECT * FROM reservations WHERE reservation_id = ${reservation_id}`;

    if (reservation.length === 0) return null;

    const r = reservation[0];

    const newStart = new Date(new Date(r.reservation_start).getTime() + ms);
    const newEnd = new Date(new Date(r.reservation_end).getTime() + ms);

    const [updatedReservation] = await sql`
      UPDATE reservations
      SET reservation_start = ${newStart},
          reservation_end = ${newEnd}
      WHERE reservation_id = ${reservation_id}
      RETURNING *
    `;

    return updatedReservation ?? null;
  },

  /**
   * extends reservation_end forward by a given number of minutes.
   * Returns the updated reservation, or null if not found.
   */
  extendReservationEnd: async (
    reservation_id: number,
    minutes: number
  ): Promise<Reservation | null> => {
    // fetch existing reservation
    const reservation =
      await sql`SELECT * FROM reservations WHERE reservation_id = ${reservation_id}`;

    if (reservation.length === 0) return null;

    const r = reservation[0];

    // calculate new end time
    const ms = minutes * 60 * 1000; // convert minutes → milliseconds
    const newEnd = new Date(new Date(r.reservation_end).getTime() + ms);

    // update only the end time
    const [updatedReservation] = await sql`
      UPDATE reservations
      SET reservation_end = ${newEnd}
      WHERE reservation_id = ${reservation_id}
      RETURNING *
    `;

    return updatedReservation ?? null;
  },

};
