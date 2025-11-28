import z from "zod";

// These are copied objects from other microservices to
// enable type checking at runtime

export const foodStatusEnum = z.enum([
  "pending",
  "cooking",
  "ready",
  "picked_up",
]);

export const orderModel = z.object({
  order_id: z.number(),
  customer_id: z.number(),
  restaurant_id: z.number(),
  total_price: z.number(),
  created_at: z.coerce.date(),
  customer_eta: z.coerce.date(),
  food_status: foodStatusEnum,
  start_cooking_time: z.coerce.date(),
});
export type Order = z.infer<typeof orderModel>;

export const reservationModel = z.object({
  reservation_id: z.number(),
  order_id: z.number(),
  charger_id: z.number(),
  created_at: z.coerce.date(),
  reservation_start: z.coerce.date(),
  reservation_end: z.coerce.date(),
  time_of_payment: z.coerce.date().nullable().optional(),
  current_soc: z.number().nullable(),
  cumulative_price_of_charge: z.number().nullable(),
  cumulative_power: z.number().nullable(),
  charge_start_time: z.coerce.date().nullable(),
});
export type Reservation = z.infer<typeof reservationModel>;
