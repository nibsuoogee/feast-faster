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
});
export type Reservation = typeof reservationModel.static;

// reservation creation

export const reservationForCreation = t.Object({
  order_id: t.Number(),
  charger_id: t.Number(),
  created_at: t.Date(),
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
    reservation_end: Date
  ): Promise<boolean> => {
    const TEN_MIN = 10 * 60 * 1000;
    const limitTime = new Date(reservation_end.getTime() + TEN_MIN);

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
};
