import { chargingModel, ReservationDTO } from "@models/chargerModel";
import { tryCatch } from "@utils/tryCatch";
import Elysia, { t } from "elysia";

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
