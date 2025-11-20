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
      const { charger_id, ...chargingData } = body;
      // 1) Update the reservation's charging details
      const [reservation, errReservation] = await tryCatch(
        ChargingDTO.updateCharging(body.charger_id, chargingData)
      );
      if (errReservation) return status(500, errReservation.message);
      if (!reservation) return status(500, "Failed to update reservation");

      const session = chargingSessions.get(body.charger_id);

      if (!session) {
        // If the session does not exist yet, create one,
        // and send the driver a notification that charging was started

        const [driverId, errDriverId] = await tryCatch(
          ChargingDTO.getUserIdByChargerId(body.charger_id)
        );
        if (errDriverId) return status(500, errDriverId.message);
        if (!driverId) return status(500, "Failed to get driver ID");

        chargingSessions.set(charger_id, driverId);

        sendToUser(driverId, "charging_started", {
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

      // Set a new 5-second timeout
      const timeout = setTimeout(() => {
        if (driverId) {
          sendToUser(driverId, "charging_stopped", {
            time: new Date().toISOString(),
          });

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
    "/desired-soc/:charger_id",
    async ({ params, status }) => {
      const { charger_id } = params;
      const chargerId = Number(charger_id);
      if (!chargerId) return status(400, "Charger ID not provided");

      // 1) Get the driver ID
      const [driverId, errDriverId] = await tryCatch(
        ChargingDTO.getUserIdByChargerId(chargerId)
      );
      if (errDriverId) return status(500, errDriverId.message);
      if (!driverId) return status(500, "Failed to get driver ID");

      // 2) Get the driver's settings
      const [settings, err] = await tryCatch(
        SettingsDTO.findSettingsByCustomerId(driverId)
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
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        console.error("Processor error: ", await response.text());
        return status(500, "Failed to stop charging");
      }

      // 2) Update payment time
      const now = new Date();
      const [reservation, errReservation] = await tryCatch(
        ChargingDTO.updateReservationTimeOfPayment(body.charger_id, now)
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
      }),
      response: {
        200: t.String(),
        401: t.String(),
        500: t.String(),
      },
    }
  );
