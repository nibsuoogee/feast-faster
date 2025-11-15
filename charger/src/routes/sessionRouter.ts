import Elysia, { t } from "elysia";
import { SessionModel, sessionModel } from "../models/sessionModel";
import { startSession } from "../services/sessionService";

export const sessions: Map<number, SessionModel> = new Map();

export const sessionRouter = new Elysia()
  .post(
    "/start-charging",
    async ({ body }) => {
      sessions.set(body.charger_id, body);

      startSession(body.charger_id);

      return "Charging started";
    },
    {
      body: sessionModel,
      response: {
        200: t.String(),
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
