import { fetch } from "elysia/dist/universal/types";
import { ChargingUpdateModel, SessionStartModel } from "../models/sessionModel";

async function sendChargingUpdate(body: ChargingUpdateModel) {
  return await fetch("https://backend.localhost/reservations/charging", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

export async function startSession(
  charger_id: number,
  sessions: Map<number, SessionStartModel>
) {
  const session = sessions.get(charger_id);

  if (!session) {
    console.error("Session was not found when starting charging");
    return;
  }

  const { desired_soc, rate_of_charge } = session;
  let current_soc = session.current_soc;
  const update: ChargingUpdateModel = {
    charger_id,
    current_soc,
    cumulative_price_of_charge: 0,
    cumulative_power: 0,
  };

  while (current_soc < desired_soc) {
    const sessionStillExists = sessions.has(charger_id);
    if (!sessionStillExists) return;

    current_soc = current_soc + rate_of_charge;

    // Simple mock cumulative values for now
    update.cumulative_power += 10;
    update.cumulative_price_of_charge += 1;

    const response = await sendChargingUpdate(update);

    if (!response.ok) {
      console.error(`Remote service error: ${await response.text()}`);
      return;
    }

    await Bun.sleep(1000);
  }
}
