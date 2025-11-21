import Elysia, { t } from "elysia";
import { jwtConfig } from "../config/jwtConfig";
import { authorizationMiddleware } from "../middleware/authorization";
import { tryCatch } from "@utils/tryCatch";
import { RestaurantDTO, restaurantOrdersModel } from "@models/restaurantModel";

export const restaurantRouter = new Elysia()
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
        "/restaurants/:id/orders",
        async ({ params, status }) => {
          const restaurantId = Number(params.id);

          const [orders, err] = await tryCatch(
            RestaurantDTO.getOrdersWithDetails(restaurantId)
          );

          if (err) return status(500, err.message);

          return orders;
        },
        {
          response: {
            200: t.Array(restaurantOrdersModel),
            401: t.String(),
            500: t.String(),
          },
        }
      )
  );
