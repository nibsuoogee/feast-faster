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

export const settingsRouter = new Elysia()
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
        .get(
          "/settings",
          async ({ user, status }) => {
            const [settings, err] = await tryCatch(
              SettingsDTO.findSettingsByCustomerId(user.user_id)
            );
            if (err) return status(500, err.message);
            if (!settings) return status(500, "Failed to get settings");

            return {
              settings,
            };
          },
          {
            response: {
              200: t.Object({
                settings: settingsModel,
              }),
              500: t.String(),
            },
          }
        )
        .post(
          "/settings",
          async ({ body, user, status }) => {
            // 1) create new settings for the user
            const settingsForCreation: SettingsModelForCreation = {
              customer_id: user.user_id,
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
            // 1) Update the user's settings
            const [settings, errSettings] = await tryCatch(
              SettingsDTO.updateSettings(user.user_id, body)
            );
            if (errSettings) return status(500, errSettings.message);
            if (!settings) return status(500, "Failed to update settings");
            return settings;
          },
          {
            body: settingsCreateBody,
            response: {
              200: settingsModel,
              500: t.String(),
            },
          }
        )
  );
