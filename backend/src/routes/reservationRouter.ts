import { ReservationDTO } from "@models/reservationModel";
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
      app.get(
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
          const [isConflicted, err] = await tryCatch(
            ReservationDTO.hasConflictingReservation(
              charger_id,
              reservation_end
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
  );
