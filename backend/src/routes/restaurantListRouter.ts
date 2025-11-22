import Elysia, { t } from "elysia";
import {
  RestaurantListDTO,
  restaurantListModel,
} from "../models/restaurantList";
import { jwtConfig } from "../config/jwtConfig";
import { authorizationMiddleware } from "../middleware/authorization";
import { tryCatch } from "../utils/tryCatch";

export const restaurantListRouter = new Elysia()
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
        "/restaurants",
        async ({ status }) => {
          const [restaurants, error] = await tryCatch(
            RestaurantListDTO.getAll(),
            "getAllRestaurants"
          );

          if (error) return status(500, error.message);

          return { restaurants };
        },
        {
          response: {
            200: t.Object({
              restaurants: t.Array(restaurantListModel),
            }),
            401: t.String(),
            500: t.String(),
          },
        }
      )
  );
