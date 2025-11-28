import { OrderDTO } from "@models/orderModel";
import {
  etaRequestModel,
  etaResponseModel,
  ReservationDTO,
  reservationModel,
} from "@models/reservationModel";
import { sendToUser } from "@utils/notification";
import { tryCatch } from "@utils/tryCatch";
import Elysia, { t } from "elysia";
import { jwtConfig } from "../config/jwtConfig";
import { authorizationMiddleware } from "../middleware/authorization";

export const reservationRouter = new Elysia()
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
        .get(
          "/reservations/can-extend/:reservation_id",
          async ({ params, status }) => {
            const { reservation_id } = params;

            // 1) Get the reservation
            const [reservation, errReservation] = await tryCatch(
              ReservationDTO.getReservationById(Number(reservation_id))
            );
            if (errReservation) return status(500, errReservation.message);
            if (!reservation) return status(500, "Failed to get reservation");
            const { charger_id, reservation_end } = reservation;

            // 2) Check conflicts
            const TEN_MIN = 10 * 60 * 1000;
            const [isConflicted, err] = await tryCatch(
              ReservationDTO.hasConflictingReservation(
                charger_id,
                reservation_end,
                TEN_MIN
              )
            );
            if (err) return status(500, err.message);
            if (isConflicted) return { extension_allowed: false };

            return { extension_allowed: true };
          },
          {
            body: t.Object({
              charger_id: t.Number(),
            }),
            response: {
              200: t.Object({ extension_allowed: t.Boolean() }),
              401: t.String(),
              500: t.String(),
            },
          }
        )
        .post(
          "/my-eta",
          async ({ body, user, status }) => {
            // 1) Get reservation
            const [reservation, errReservation] = await tryCatch(
              ReservationDTO.getReservationById(body.reservation_id)
            );
            if (errReservation) return status(500, errReservation.message);
            if (!reservation) return status(500, "Failed to get reservation");

            // Get order
            const [order, errOrder] = await tryCatch(
              OrderDTO.getOrder(body.order_id)
            );
            if (errOrder) return status(500, errOrder.message);
            if (!order) return status(500, "Failed to get order");

            const latenessMs = body.lateness_in_minutes * 60 * 1000;

            const newEta = new Date(order.customer_eta.getTime() + latenessMs);

            // 4) Check whether the driver is on schedule
            const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
            const isLate =
              newEta.getTime() - reservation.reservation_start.getTime() >
              FIFTEEN_MINUTES_MS;
            if (!isLate)
              return {
                order: order,
                reservation: reservation,
              };

            // 5) Check conflicts
            const [isConflicted, err] = await tryCatch(
              ReservationDTO.hasConflictingReservation(
                reservation.charger_id,
                reservation.reservation_end,
                latenessMs
              )
            );
            if (err) return status(500, err.message);
            if (isConflicted) {
              sendToUser(user.user_id, "reservation_shift_not_allowed", {
                time: new Date().toISOString(),
              });
              return {
                order: order,
                reservation: reservation,
              };
            }

            // 6) Extend reservation
            const [shiftedReservation, errShifted] = await tryCatch(
              ReservationDTO.shiftReservation(body.reservation_id, 5)
            );
            if (errShifted) return status(500, errShifted.message);
            if (!shiftedReservation)
              return status(500, "Failed to shift reservation");

            sendToUser(user.user_id, "reservation_shift_success", {
              time: new Date().toISOString(),
            });

            const FIVE_MINUTES_MS = 5 * 60 * 1000;
            const newCookingTime = new Date(
              order.start_cooking_time.getTime() + FIVE_MINUTES_MS
            );

            // 3) Save the new eta in the order
            const [newOrder, newErrOrder] = await tryCatch(
              OrderDTO.updateOrderETA(reservation.order_id, {
                customer_eta: newEta,
                start_cooking_time: newCookingTime,
              })
            );
            if (newErrOrder) return status(500, newErrOrder.message);
            if (!newOrder) return status(500, "Failed to update ETA");

            return {
              order: newOrder,
              reservation: shiftedReservation,
            };
          },
          {
            body: etaRequestModel,
            response: {
              200: etaResponseModel,
              500: t.String(),
            },
          }
        )
        .patch(
          "/reservations/extend/:reservation_id",
          async ({ params, status, user }) => {
            const { reservation_id } = params;

            // fetch reservation
            const [reservation, errReservation] = await tryCatch(
              ReservationDTO.getReservationById(Number(reservation_id))
            );
            if (errReservation) return status(500, errReservation.message);
            if (!reservation) return status(404, "Reservation not found");

            const { charger_id, reservation_end } = reservation;

            // check conflicting reservations
            const TEN_MIN = 10 * 60 * 1000;

            const [isConflicted, err] = await tryCatch(
              ReservationDTO.hasConflictingReservation(
                charger_id,
                reservation_end,
                TEN_MIN
              )
            );

            if (err) return status(500, err.message);

            if (isConflicted) {
              sendToUser(user.user_id, "reservation_extension_not_allowed", {
                time: new Date().toISOString(),
              });

              return status(200, {
                message: "Extension not allowed",
                extended: false,
              });
            }

            // extend reservation by 10 minutes
            const [updatedReservation, errShift] = await tryCatch(
              ReservationDTO.extendReservationEnd(Number(reservation_id), 10)
            );

            if (errShift) return status(500, errShift.message);
            if (!updatedReservation)
              return status(500, "Failed to update reservation");

            // notify user via SSE
            sendToUser(user.user_id, "reservation_extension_success", {
              reservation_id,
              new_end: updatedReservation.reservation_end,
            });

            return {
              message: "Reservation extended by 10 minutes",
              extended: true,
              reservation: updatedReservation,
            };
          },
          {
            response: {
              200: t.Object({
                message: t.String(),
                extended: t.Boolean(),
                reservation: t.Optional(reservationModel),
              }),
              404: t.String(),
              500: t.String(),
            },
          }
        )
  );
