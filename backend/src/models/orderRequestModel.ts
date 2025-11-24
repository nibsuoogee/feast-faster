import { t } from "elysia";
import { reservationModel } from "@models/reservationModel";
import { restaurantModel } from "@models/restaurantModel";
import { orderItemModel } from "@models/orderItemModel";
import { orderModel } from "./orderModel";

export const createOrderBody = t.Object({
  restaurant_id: t.Number(),
  station_id: t.Number(),
  items: t.Array(
    t.Object({
      menuItem: t.Object({
        menu_item_id: t.Number(),
        name: t.String(),
        description: t.Optional(t.String()),
        price: t.Number(),
      }),
      quantity: t.Number(),
    })
  ),
  customerEta: t.Optional(t.String()),
  reservationStart: t.Optional(t.String()),
  reservationEnd: t.Optional(t.String()),
  currentSoc: t.Optional(t.Number()),
});
export type CreateOrderBody = typeof createOrderBody.static;

export const createOrderResponse = t.Object({
  message: t.String(),
  order: orderModel,
  order_items: t.Array(orderItemModel),
  reservation: reservationModel,
  restaurant: restaurantModel,
  station_name: t.String(),
});
export type CreateOrderResponse = typeof createOrderResponse.static;
