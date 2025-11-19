import { tryCatch } from "@utils/tryCatch";
import Elysia, { t } from "elysia";
import { jwtConfig } from "../config/jwtConfig";
import { authorizationMiddleware } from "../middleware/authorization";
import {
  FoodStatus,
  OrderDTO,
  orderModel,
  orderUpdateStatusBody,
} from "@models/orderModel";
import { sendToUser } from "@utils/notification";

const foodStatusMessage: Record<FoodStatus, string> = {
  pending: "Your meal is not being cooked yet.",
  cooking: "Your meal is now being cooked.",
  ready: "Your meal is ready.",
  picked_up: "Your meal was successfully picked up.",
};

import {
  OrderDTO,
  OrderModelForCreation,
  orderModel,
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

import { tryCatch } from "@utils/tryCatch";


// schema that is expected (runtime validation)

const createOrderBody = t.Object({
  restaurantId: t.Number(),
  stationId: t.Number(),
  items: t.Array(
    t.Object({
      menuItem: t.Object({
        id: t.Number(),
        name: t.String(),
        description: t.Optional(t.String()),
        price: t.Number(),
      }),
      quantity: t.Number(),
    })
  ),
  customerEta: t.Optional(t.String()),
  isPaid: t.Boolean(),
  reservationStart: t.Optional(t.String()),
  reservationEnd: t.Optional(t.String()),
  currentSoc: t.Optional(t.Number()),
  orderTime: t.Optional(t.String()),
});


// response schema

const createOrderResponse = t.Object({
  message: t.String(),
  order: orderModel,
  items: t.Array(orderItemModel),
  reservation: reservationModel,
});


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
      app.patch(
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
