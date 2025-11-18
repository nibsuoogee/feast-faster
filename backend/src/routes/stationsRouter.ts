import Elysia, { t } from "elysia";
import { jwtConfig } from "../config/jwtConfig";
import { authorizationMiddleware } from "../middleware/authorization";
import {
  stationsFilterModel,
  stationsModel,
  StationsDTO,
} from "@models/stationsModel";
import { tryCatch } from "@utils/tryCatch";

export const stationsRouter = new Elysia()
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
      app.post(
        "/filtered-stations",
        async ({ body, status }) => {
          const [stations, errStations] = await tryCatch(
            StationsDTO.getFilteredStations(body)
          );

          if (errStations) return status(500, errStations.message);
          if (!stations) return status(500, "Failed to return stations");

          return { stations };
        },
        {
          body: stationsFilterModel,
          response: {
            200: t.Object({
              stations: stationsModel,
            }),
            500: t.String(),
          },
        }
      )
  );
