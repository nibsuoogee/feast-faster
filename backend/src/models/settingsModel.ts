import { t } from "elysia";
import { sql } from "bun";

export const SettingsDTO = {
  findSettingsByCustomerId: async (customer_id: number): Promise<Settings> => {
    const result =
      await sql`SELECT * FROM settings WHERE customer_id = ${customer_id}`;
    return result[0];
  },
  createSettings: async (
    settings: SettingsModelForCreation
  ): Promise<Settings> => {
    const toPgArray = (arr: string[] | undefined) => {
      if (!arr) return null;
      // Escape double quotes and backslashes
      const escaped = arr.map((s) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"'));
      return `{${escaped.join(",")}}`;
    };

    const cuisinesLiteral = toPgArray(settings.cuisines);

    const [newSettings] = await sql`
      INSERT INTO settings (customer_id, vehicle_model, connector_type, desired_soc, cuisines)
      VALUES (
        ${settings.customer_id},
        ${settings.vehicle_model},
        ${settings.connector_type},
        ${settings.desired_soc},
        ${cuisinesLiteral == null ? null : sql`${cuisinesLiteral}::varchar[]`}
      )
      RETURNING *
    `;

    return newSettings;
  },
  updateSettings: async (
    customer_id: number,
    settings: SettingsCreateBody
  ): Promise<Settings> => {
    const toPgArray = (arr: string[] | undefined) => {
      if (!arr) return null;
      const escaped = arr.map((s) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"'));
      return `{${escaped.join(",")}}`;
    };

    const cuisinesLiteral = toPgArray((settings as any).cuisines);

    const [newSettings] = await sql`
      UPDATE settings SET
        vehicle_model = ${settings.vehicle_model},
        connector_type = ${settings.connector_type},
        desired_soc = ${settings.desired_soc},
        cuisines = ${cuisinesLiteral == null ? null : sql`${cuisinesLiteral}::varchar[]`}
      WHERE customer_id = ${customer_id}
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
export type Settings = typeof settingsModel.static;

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
