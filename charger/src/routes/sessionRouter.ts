import Elysia, { t } from "elysia";
import { sessionModel, SessionStartModel } from "../models/sessionModel";
import { startSession } from "../services/sessionService";

const sessions: Map<number, SessionStartModel> = new Map();

export const sessionRouter = new Elysia()
  .post(
    "/start-charging",
    async ({ body }) => {
      const { charger_id, ...rest } = body;
      sessions.set(body.charger_id, rest);

      startSession(charger_id, sessions);

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
    "/end-charging",
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
