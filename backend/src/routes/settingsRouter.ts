import Elysia, { t } from "elysia";
import { jwtConfig } from "../config/jwtConfig";
import { authorizationMiddleware } from "../middleware/authorization";
import {
  settingsCreateBody,
  SettingsDTO,
  settingsModel,
  SettingsModelForCreation,
} from "@models/settingsModel";
import { tryCatch } from "@utils/tryCatch";

export const calendarRouter = new Elysia()
  .use(jwtConfig)
  .derive(authorizationMiddleware)
  .guard(
    {
      beforeHandle: async ({ headers, jwt_auth, status }) => {
        const { user } = await authorizationMiddleware({ headers, jwt_auth });
        if (!user) return status(401, "Not Authorized");

        return { user };
      },
    },
    (app) =>
      app
        .post(
          "/settings",
          async ({ body, user, status }) => {
            // 1) create new settings for the user
            const settingsForCreation: SettingsModelForCreation = {
              customer_id: user.id,
              ...body,
            };
            const [settings, errSettings] = await tryCatch(
              SettingsDTO.createSettings(settingsForCreation)
            );
            if (errSettings) return status(500, errSettings.message);
            if (!settings) return status(500, "Failed to create settings");

            return { settings };
          },
          {
            body: settingsCreateBody,
            response: {
              200: t.Object({
                settings: settingsModel,
              }),
              500: t.String(),
            },
          }
        )
        .patch(
          "/settings",
          async ({ body, user, status }) => {
            // 1) check if the user owns the calendar
            // const [isCalendarOwner, errOwner] = await tryCatch(
            //   CalendarDTO.isCalendarOwner(body.id, user.id)
            // );
            // if (errOwner) return status(500, errOwner.message);
            // if (!isCalendarOwner)
            //   return status(401, "No authorized access to calendar");
            // // 2) Update the calendar
            // const { id, ...calendarForUpdate } = body;
            // const [calendar, errCalendar] = await tryCatch(
            //   CalendarDTO.updateCalendar(id, calendarForUpdate)
            // );
            // if (errCalendar) return status(500, errCalendar.message);
            // if (!calendar) return status(500, "Failed to update calendar");
            // return calendar;
          }
          // {
          //   body: calendarUpdateBody,
          //   response: {
          //     200: calendarModel,
          //     401: t.String(),
          //     500: t.String(),
          //   },
          // }
        )
  );
