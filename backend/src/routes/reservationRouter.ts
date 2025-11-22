import { ReservationDTO, reservationModel } from "@models/reservationModel";
import { tryCatch } from "@utils/tryCatch";
import Elysia, { t } from "elysia";
import { jwtConfig } from "../config/jwtConfig";
import { authorizationMiddleware } from "../middleware/authorization";
import { sendToUser } from "@utils/notification";
import { OrderDTO, orderModel } from "@models/orderModel";

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

            // 1) Calculate new ETA using processor
            // fetch PROCESSOR_URL/calculate-eta ... body.location ...

            // Mock ETA
            const SIXTEEN_MIN = 19 * 60 * 1000;
            const newETA = new Date(
              reservation.reservation_start.getTime() + SIXTEEN_MIN
            );

            // 3) Save the new eta in the order
            const [order, errOrder] = await tryCatch(
              OrderDTO.updateOrderETA(reservation.order_id, newETA)
            );
            if (errOrder) return status(500, errOrder.message);
            if (!order) return status(500, "Failed to update order ETA");

            // 4) Check whether the driver is on schedule
            const FIFTEEN_MIN = 15 * 60 * 1000;
            const isMoreThan15MinAfter =
              newETA.getTime() - reservation.reservation_start.getTime() >
              FIFTEEN_MIN;
            if (!isMoreThan15MinAfter) return "Driver on schedule";

            // 5) Check conflicts
            const FIVE_MIN = 5 * 60 * 1000; // Default extension time
            const [isConflicted, err] = await tryCatch(
              ReservationDTO.hasConflictingReservation(
                reservation.charger_id,
                reservation.reservation_end,
                FIVE_MIN
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

            return {
              order: order,
              reservation: shiftedReservation,
            };
          },
          {
            body: t.Object({
              reservation_id: t.Number(),
              location: t.Tuple([t.Number(), t.Number()]),
            }),
            response: {
              200: t.Object({
                order: orderModel,
                reservation: reservationModel,
              }),
              500: t.String(),
            },
          }
        )
  );
