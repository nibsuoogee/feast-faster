import { t } from "elysia";

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
