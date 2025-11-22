import Elysia, { t } from "elysia";
import { jwtConfig } from "../config/jwtConfig";
import { authorizationMiddleware } from "../middleware/authorization";
import {
  stationsFilterModel,
  stationsModel,
  StationsDTO,
} from "@models/stationsModel";
import { tryCatch } from "@utils/tryCatch";
import { MenuItemsDTO } from "@models/menuItemModel";
import { stationWithMenusModel } from "@models/stationModel";

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
      app
        .post(
          "/filtered-stations",
          async ({ body, status }) => {
            // 1) Get suitable stations
            const [stations, errStations] = await tryCatch(
              StationsDTO.getFilteredStations(body)
            );
            if (errStations) return status(500, errStations.message);
            if (!stations) return status(500, "Failed to return stations");

            // 2) Get menu items for all restaurants in all stations
            const stationsWithMenuItems = await Promise.all(
              stations.map(async (station) => {
                const restaurantsWithMenuItems = await Promise.all(
                  station.restaurants.map(async (restaurant) => {
                    const [menuItems, error] = await tryCatch(
                      MenuItemsDTO.getMenuItems(restaurant.restaurant_id)
                    );

                    if (error) {
                      console.error(
                        `Failed to fetch menu items for restaurant ${restaurant.restaurant_id}:`,
                        error.message
                      );
                      return {
                        ...restaurant,
                        menu: [],
                      };
                    }

                    return {
                      ...restaurant,
                      menu: menuItems || [],
                    };
                  })
                );

                return {
                  ...station,
                  restaurants: restaurantsWithMenuItems,
                };
              })
            );

            console.log(stations);

            return stationsWithMenuItems;
          },
          {
            body: stationsFilterModel,
            response: {
              200: t.Array(stationWithMenusModel),
              500: t.String(),
            },
          }
        )
        .post(
          "/station/availability",
          async ({ body, status }) => {
            const { station_id, reservation_start, reservation_end } = body;
            const [availableChargers, err] = await tryCatch(
              StationsDTO.getAvailableChargers(
                station_id,
                reservation_start,
                reservation_end
              )
            );
            if (err) return status(500, err.message);

            return { chargers: availableChargers };
          },
          {
            body: t.Object({
              station_id: t.Number(),
              reservation_start: t.Date(),
              reservation_end: t.Date(),
            }),
            response: {
              200: t.Object({
                chargers: t.Array(t.Number()),
              }),
              500: t.String(),
            },
          }
        )
  );
