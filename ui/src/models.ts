import z from "zod";

// These are copied objects from other microservices to
// enable type checking at runtime

export const reservationModel = z.object({
  reservation_id: z.number(),
  order_id: z.number(),
  charger_id: z.number(),
  created_at: z.coerce.date(),
  reservation_start: z.coerce.date(),
  reservation_end: z.coerce.date(),
  time_of_payment: z.coerce.date().nullable(),
  current_soc: z.number().nullable(),
  cumulative_price_of_charge: z.number().nullable(),
  cumulative_power: z.number().nullable(),
});
