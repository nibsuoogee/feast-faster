import { chargingModel, ChargingDTO } from "@models/chargerModel";
import { SettingsDTO } from "@models/settingsModel";
import { sendToUser } from "@utils/notification";
import { tryCatch } from "@utils/tryCatch";
import Elysia, { t } from "elysia";
import { CHARGER_URL } from "../lib/urls";
import { authorizationMiddleware } from "../middleware/authorization";
import { jwtConfig } from "../config/jwtConfig";

export const chargingSessions = new Map<number, number>();
const chargingTimeouts = new Map<number, NodeJS.Timeout>(); // charger_id -> timeout

export const chargerRouter = new Elysia()
  .use(jwtConfig)
  .derive(authorizationMiddleware)
  .patch(
    "/charging",
    async ({ query, body, status }) => {
      const { charger_id, user_id, ...chargingData } = body;
      // 1) Update the reservation's charging details
      const [reservation, errReservation] = await tryCatch(
        ChargingDTO.updateCharging(charger_id, user_id, chargingData)
      );
      if (errReservation) return status(500, errReservation.message);
      if (!reservation) return status(500, "Failed to update reservation");

      const session = chargingSessions.get(charger_id);

      if (!session) {
        // If the session does not exist yet, create one,
        // and send the driver a notification that charging was started

        // Update charging start time
        const [startTime, errStartTime] = await tryCatch(
          ChargingDTO.updateChargingStartTime(
            reservation.reservation_id,
            new Date()
          )
        );
        if (errStartTime) return status(500, errStartTime.message);
        if (!startTime)
          return status(500, "Failed to update charging start time");

        chargingSessions.set(charger_id, user_id);

        sendToUser(user_id, "charging_started", {
          time: new Date().toISOString(),
        });
      }

      // Clear any existing timeout
      if (chargingTimeouts.has(charger_id)) {
        clearTimeout(chargingTimeouts.get(charger_id)!);
      }

      const driverId = chargingSessions.get(charger_id);

      if (driverId) {
        sendToUser(driverId, "reservation_data", {
          reservation: reservation,
          time: new Date().toISOString(),
        });
      }

      const timeout = setTimeout(async () => {
        if (driverId) {
          sendToUser(driverId, "charging_stopped", {
            time: new Date().toISOString(),
          });

          // Pay for charging
          const now = new Date();
          const [updatedReservation, errUpdatedReservation] = await tryCatch(
            ChargingDTO.updateReservationTimeOfPayment(
              reservation.reservation_id,
              now
            )
          );
          if (errUpdatedReservation)
            return status(500, errUpdatedReservation.message);
          if (!updatedReservation)
            return status(500, "Failed to set time of payment");

          // Clean up the session
          chargingSessions.delete(charger_id);
          chargingTimeouts.delete(charger_id);
        }
      }, 3000); // 3 seconds

      chargingTimeouts.set(charger_id, timeout);

      return "Charging updated";
    },
    {
      body: chargingModel,
      response: {
        200: t.String(),
        500: t.String(),
      },
    }
  )
  .get(
    "/desired-soc/:charger_id/:user_id",
    async ({ params, status }) => {
      const { charger_id, user_id } = params;
      const chargerId = Number(charger_id);
      if (!chargerId) return status(400, "Charger ID not provided");
      const userId = Number(user_id);
      if (!userId) return status(400, "User ID not provided");

      // 1) Get the driver's settings
      const [settings, err] = await tryCatch(
        SettingsDTO.findSettingsByCustomerId(userId)
      );
      if (err) return status(500, err.message);
      if (!settings) return status(500, "Failed to get settings");

      return { desired_soc: settings.desired_soc };
    },
    {
      response: {
        200: t.Object({ desired_soc: t.Number() }),
        400: t.String(),
        500: t.String(),
      },
    }
  )
  .post(
    "/finish-charging",
    async ({ headers, jwt_auth, body, status }) => {
      // Authentication in route because this is the only one meant for drivers
      const { user } = await authorizationMiddleware({ headers, jwt_auth });
      if (!user) return status(401, "Not Authorized");

      const userId = user.user_id;

      // 1) Stop charging
      const response = await fetch(`${CHARGER_URL}/stop-charging`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ charger_id: body.charger_id }),
      });

      if (!response.ok) {
        console.error("Processor error: ", await response.text());
        return status(500, "Failed to stop charging");
      }

      // 2) Update payment time
      const now = new Date();
      const [reservation, errReservation] = await tryCatch(
        ChargingDTO.updateReservationTimeOfPayment(body.reservation_id, now)
      );
      if (errReservation) return status(500, errReservation.message);
      if (!reservation) return status(500, "Failed to set time of payment");

      sendToUser(userId, "charging_paid", {
        time: new Date().toISOString(),
      });

      return "Charging stopped";
    },
    {
      body: t.Object({
        charger_id: t.Number(),
        reservation_id: t.Number(),
      }),
      response: {
        200: t.String(),
        401: t.String(),
        500: t.String(),
      },
    }
  );
