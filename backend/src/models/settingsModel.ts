import { t } from "elysia";
import { sql } from "bun";

export const SettingsDTO = {
  createSettings: async (
    settings: SettingsModelForCreation
  ): Promise<SettingsModel> => {
    const [newSettings] = await sql`
      INSERT INTO settings ${sql(settings)}
      RETURNING *
    `;

    return newSettings;
  },
};

export const settingsModel = t.Object({
  settings_id: t.Number(),
  customer_id: t.Number(),
  vehicle_model: t.String(),
  connector_type: t.String(),
  desired_soc: t.Number(),
  cuisines: t.Array(t.String()),
  created_at: t.Date(),
});
export type SettingsModel = typeof settingsModel.static;

export const settingsModelForCreation = t.Object({
  customer_id: t.Number(),
  vehicle_model: t.String(),
  connector_type: t.String(),
  desired_soc: t.Number(),
  cuisines: t.Array(t.String()),
});
export type SettingsModelForCreation = typeof settingsModelForCreation.static;

export const settingsCreateBody = t.Omit(settingsModelForCreation, [
  "customer_id",
]);
export type SettingsCreateBody = typeof settingsCreateBody.static;
