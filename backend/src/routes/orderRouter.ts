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
} from "@models/reservationModel";

import {
  createOrderBody,
  createOrderResponse,
} from "@models/orderRequestModel";

import { RestaurantDTO } from "@models/restaurantModel";
import { StationDTO } from "@models/stationModel";
import { StationsDTO } from "@models/stationsModel";

const foodStatusMessage: Record<FoodStatus, string> = {
  pending: "Your meal is not being cooked yet.",
  cooking: "Your meal is now being cooked.",
  ready: "Your meal is ready.",
  picked_up: "Your meal was successfully picked up.",
};

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
            const reservationStart = new Date(body.reservation_start);

            const reservationEnd = new Date(body.reservation_end);

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
              total_price: body.total_price,
              customer_eta: body.customer_eta,
              start_cooking_time: body.start_cooking_time,
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
        .delete(
          "/order/:order_id",
          async ({ user, params, status }) => {
            const orderId = Number(params.order_id);
            if (!orderId) return status(400, "Order ID not provided");

            // 1) Check user owns the order
            const [order, errOrder] = await tryCatch(
              OrderDTO.userOwnsOrder(user.user_id, orderId)
            );
            if (errOrder) return status(500, errOrder.message);
            if (!order) return status(401, "User does not own the order");

            // 2) Delete the order
            const [deleted, errDelete] = await tryCatch(
              OrderDTO.delete(orderId)
            );
            if (errDelete) return status(500, errDelete.message);
            if (!deleted) return status(400, "Order deletion failed");

            return {
              success: true,
            };
          },
          {
            response: {
              200: t.Object({ success: t.Boolean() }),
              400: t.String(),
              401: t.String(),
              500: t.String(),
            },
          }
        )
  );
