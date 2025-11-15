import { chargingModel, ReservationDTO } from "@models/chargerModel";
import { tryCatch } from "@utils/tryCatch";
import Elysia, { t } from "elysia";
import { sendToUser } from "./notificationRouter";

export const chargingSessions = new Map<number, number>();
const chargingTimeouts = new Map<number, NodeJS.Timeout>(); // charger_id -> timeout

export const chargerRouter = new Elysia().patch(
  "/charging",
  async ({ query, body, status }) => {
    const { charger_id, ...chargingData } = body;
    // 1) Update the reservation's charging details
    const [reservation, errReservation] = await tryCatch(
      ReservationDTO.updateCharging(body.charger_id, chargingData)
    );
    if (errReservation) return status(500, errReservation.message);
    if (!reservation) return status(500, "Failed to update reservation");

    console.log("Charging updated");

    const session = chargingSessions.get(body.charger_id);

    if (!session) {
      // If the session does not exist yet, create one,
      // and send the driver a notification that charging was started

      const [driverId, errDriverId] = await tryCatch(
        ReservationDTO.getUserIdByChargerId(body.charger_id)
      );
      if (errDriverId) return status(500, errDriverId.message);
      if (!driverId) return status(500, "Failed to get driver ID");

      chargingSessions.set(charger_id, driverId);

      sendToUser(driverId, "notification", {
        message: "Charging started",
        time: new Date().toISOString(),
      });
    }

    // Clear any existing timeout
    if (chargingTimeouts.has(charger_id)) {
      clearTimeout(chargingTimeouts.get(charger_id)!);
    }

    // Set a new 5-second timeout
    const timeout = setTimeout(() => {
      const driverId = chargingSessions.get(charger_id);
      if (driverId) {
        sendToUser(driverId, "notification", {
          message: "Charging stopped",
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
);
