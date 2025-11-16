import z from "zod";

// These are copied objects from other microservices to
// enable type checking at runtime

export const reservationModel = z.object({
  reservation_id: z.number(),
  order_id: z.number(),
  charger_id: z.number(),
  created_at: z.string(),
  reservation_start: z.string(),
  reservation_end: z.string(),
  time_of_payment: z.nullable(z.string()),
  current_soc: z.nullable(z.number()),
  cumulative_price_of_charge: z.nullable(z.number()),
  cumulative_power: z.nullable(z.number()),
});
