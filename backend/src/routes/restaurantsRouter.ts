import { Elysia, t } from "elysia";
import { RestaurantsDTO, restaurantModel } from "../models/restaurants";
import { tryCatch } from "../utils/tryCatch";

export const restaurantsRouter = new Elysia({ prefix: "/restaurants" })
  .get(
    "/",
    async ({ status }) => {
      const [restaurants, error] = await tryCatch(
        RestaurantsDTO.getAll(),
        "getAllRestaurants"
      );

      if (error) return status(500, error.message);

      return { restaurants };
    },
    {
      response: {
        200: t.Object({
          restaurants: t.Array(restaurantModel),
        }),
        500: t.String(),
      },
    }
  );
