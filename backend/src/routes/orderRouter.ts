import { tryCatch } from "@utils/tryCatch";
import Elysia, { t } from "elysia";
import { jwtConfig } from "../config/jwtConfig";
import { authorizationMiddleware } from "../middleware/authorization";

import { sendToUser } from "@utils/notification";

import {
  FoodStatus,
  OrderDTO,
  OrderModelForCreation,
  orderModel,
  orderUpdateStatusBody,
} from "@models/orderModel";

import {
  OrderItemDTO,
  OrderItemForCreation,
  orderItemModel,
} from "@models/orderItemModel";

import {
  ReservationDTO,
  ReservationForCreation,
  reservationModel,
} from "@models/reservationModel";
import { RestaurantDTO, restaurantModel } from "@models/restaurantModel";
import { StationDTO } from "@models/stationModel";
import { StationsDTO } from "@models/stationsModel";
import { convertToHelsinki } from "../lib/timezone";

const foodStatusMessage: Record<FoodStatus, string> = {
  pending: "Your meal is not being cooked yet.",
  cooking: "Your meal is now being cooked.",
  ready: "Your meal is ready.",
  picked_up: "Your meal was successfully picked up.",
};

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

export const orderRouter = new Elysia()
  .use(jwtConfig)
  .derive(authorizationMiddleware)
  .guard(
    {
      beforeHandle: async ({ headers, jwt_auth, status }) => {
        const { user } = await authorizationMiddleware({ headers, jwt_auth });
        if (!user) return status(401, "Not Authorized");
      },
    },
    (app) =>
      app
        .post(
          "/orders",
          async ({ body, user, status }) => {
            // Convert "now" to Helsinki time
            const nowHelsinki = convertToHelsinki(new Date());

            const reservationStart = body.reservationStart
              ? convertToHelsinki(new Date(body.reservationStart))
              : new Date(nowHelsinki.getTime() + 30 * 60 * 1000); // 30 mins from reservation created syncing with food ready

            const reservationEnd = body.reservationEnd
              ? convertToHelsinki(new Date(body.reservationEnd))
              : new Date(reservationStart.getTime() + 30 * 60 * 1000); // 30 mins after start

            const [availableChargerIds, err] = await tryCatch(
              StationsDTO.getAvailableChargers(
                body.station_id,
                reservationStart,
                reservationEnd
              )
            );
            if (err) return status(500, err.message);
            if (!availableChargerIds)
              return status(409, "No suitable chargers available");

            // create Order
            const orderData: OrderModelForCreation = {
              customer_id: user.user_id,
              restaurant_id: body.restaurant_id,
              total_price: Number(
                body.items
                  .reduce(
                    (total, i) => total + i.menuItem.price * i.quantity,
                    0
                  )
                  .toFixed(2)
              ),
              // add 30 mins as estimated arrival time if received eta is empty.
              customer_eta: body.customerEta
                ? new Date(body.customerEta)
                : new Date(Date.now() + 30 * 60 * 1000),
            };

            const [order, errOrder] = await tryCatch(
              OrderDTO.createOrder(orderData)
            );

            if (errOrder) return status(500, errOrder.message);
            if (!order) return status(500, "Failed to create order");

            // create order_items
            const order_items: (typeof orderItemModel.static)[] = [];

            for (const i of body.items) {
              const itemData: OrderItemForCreation = {
                order_id: order.order_id,
                menu_item_id: i.menuItem.menu_item_id,
                name: i.menuItem.name,
                details: i.menuItem.description ?? "",
                price: i.menuItem.price,
                quantity: i.quantity,
              };

              const [createdItem, errItem] = await tryCatch(
                OrderItemDTO.createOrderItem(itemData)
              );

              if (errItem) return status(500, errItem.message);
              order_items.push(createdItem);
            }

            const reservationData: ReservationForCreation = {
              order_id: order.order_id,
              charger_id: availableChargerIds[0],
              reservation_start: reservationStart,
              reservation_end: reservationEnd,
            };
            const [reservation, errReservation] = await tryCatch(
              ReservationDTO.createReservation(reservationData)
            );
            if (errReservation) return status(500, errReservation.message);
            if (!reservation)
              return status(500, "Failed to create reservation");

            // Get restaurant
            const [restaurant, errRestaurant] = await tryCatch(
              RestaurantDTO.getRestaurant(order.restaurant_id)
            );
            if (errRestaurant) return status(500, errRestaurant.message);
            if (!restaurant) return status(500, "Failed to get restaurant");

            // Get station_name
            const [station, errStation] = await tryCatch(
              StationDTO.getStation(restaurant.station_id)
            );
            if (errStation) return status(500, errStation.message);
            if (!station) return status(500, "Failed to get station name");

            // final response
            return {
              message: "Order and reservation created successfully",
              order,
              order_items,
              reservation,
              restaurant,
              station_name: station.name,
            };
          },
          {
            body: createOrderBody,
            response: {
              200: createOrderResponse,
              400: t.String(),
              409: t.String(),
              401: t.String(),
              500: t.String(),
            },
          }
        )
        .patch(
          "/order-status",
          async ({ body, status }) => {
            // 1) Update the order food status
            const [order, errOrder] = await tryCatch(
              OrderDTO.updateOrderStatus(body.order_id, body.food_status)
            );
            if (errOrder) return status(500, errOrder.message);
            if (!order) return status(500, "Failed to update order status");

            sendToUser(order.customer_id, "food_status", {
              message: foodStatusMessage[order.food_status],
              time: new Date().toISOString(),
            });

            return order;
          },
          {
            body: orderUpdateStatusBody,
            response: {
              200: orderModel,
              500: t.String(),
            },
          }
        )
  );
