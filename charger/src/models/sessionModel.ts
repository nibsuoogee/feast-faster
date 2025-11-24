import { t } from "elysia";

export const sessionModel = t.Object({
  charger_id: t.Number(),
  user_id: t.Number(),
  current_soc: t.Number(),
  rate_of_charge: t.Number(),
});
export type SessionModel = typeof sessionModel.static;

export const sessionStartModel = t.Omit(sessionModel, ["charger_id"]);
export type SessionStartModel = typeof sessionStartModel.static;

export const chargingUpdateModel = t.Object({
  charger_id: t.Number(),
  user_id: t.Number(),
  current_soc: t.Number(),
  cumulative_price_of_charge: t.Number(),
  cumulative_power: t.Number(),
});
export type ChargingUpdateModel = typeof chargingUpdateModel.static;
