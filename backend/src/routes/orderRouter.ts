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


const foodStatusMessage: Record<FoodStatus, string> = {
  pending: "Your meal is not being cooked yet.",
  cooking: "Your meal is now being cooked.",
  ready: "Your meal is ready.",
  picked_up: "Your meal was successfully picked up.",
};

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
      app
        .post(
          "/orders",
          async ({ body, user, status }) => {
        
            // create Order

            const createdAt = body.orderTime
              ? new Date(body.orderTime)
              : new Date();

            const orderData: OrderModelForCreation = {
            
              customer_id: user.user_id,
              restaurant_id: body.restaurantId,
              total_price: Number(body.items.reduce((total, i) => total + i.menuItem.price * i.quantity, 0).toFixed(2)
              ),
              created_at: createdAt,
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

            const createdItems: typeof orderItemModel.static[] = [];

            for (const i of body.items) {
              const itemData: OrderItemForCreation = {
                order_id: order.order_id,
                menu_item_id: i.menuItem.id,
                name: i.menuItem.name,
                details: i.menuItem.description ?? "",
                price: i.menuItem.price,
                quantity: i.quantity,
                created_at: createdAt,
              };

              const [createdItem, errItem] = await tryCatch(
                OrderItemDTO.createOrderItem(itemData)
              );

              if (errItem) return status(500, errItem.message);
              createdItems.push(createdItem);
              }

            // create reservation

            const reservationStart = body.reservationStart
              ? new Date(body.reservationStart)
              : new Date(new Date().getTime() + 30 * 60 * 1000); // 30 mins from reservation created syncing with food ready 

            const reservationEnd = body.reservationEnd
              ? new Date(body.reservationEnd)
              : new Date(reservationStart.getTime() + 30 * 60 * 1000); // 30 mins after start

            const reservationData: ReservationForCreation = {
              order_id: order.order_id,
              charger_id: body.stationId,
              created_at: new Date(),
              reservation_start: reservationStart,
              reservation_end: reservationEnd,
            };
            const [reservation, errReservation] = await tryCatch(
              ReservationDTO.createReservation(reservationData)
            );

            if (errReservation) return status(500, errReservation.message);
            if (!reservation)
              return status(500, "Failed to create reservation");

            // final response

            return {
              message: "Order and reservation created successfully",
              order,
              items: createdItems,
              reservation,
            };
          },
          {
            body: createOrderBody,
            response: {
              200: createOrderResponse,
              400: t.String(),
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
