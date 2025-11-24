import Elysia, { t } from "elysia";
import { SessionModel, sessionModel } from "../models/sessionModel";
import {
  getDesiredSocWithChargerId,
  startSession,
} from "../services/sessionService";

export const sessions: Map<number, SessionModel> = new Map();

export const sessionRouter = new Elysia()
  .post(
    "/start-charging",
    async ({ body, status }) => {
      sessions.set(body.charger_id, body);

      // Get the driver's desired SoC
      const socResponse = await getDesiredSocWithChargerId(
        body.charger_id,
        body.user_id
      );

      if (!socResponse.ok) {
        console.error(`Remote service error: ${await socResponse.text()}`);
        return status(500, "Failed to get desired soc from backend");
      }

      const socData = await socResponse.json();

      startSession(body.charger_id, body.user_id, socData.desired_soc);

      return "Charging started";
    },
    {
      body: sessionModel,
      response: {
        200: t.String(),
        500: t.String(),
      },
    }
  )
  .post(
    "/stop-charging",
    async ({ body, status }) => {
      const success = sessions.delete(body.charger_id);

      if (!success) return status(404, "Charging session was not found");

      return "Charging session deleted";
    },
    {
      body: t.Object({ charger_id: t.Number() }),
      response: {
        200: t.String(),
        404: t.String(),
      },
    }
  );
