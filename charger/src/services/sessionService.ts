import { ChargingUpdateModel } from "../models/sessionModel";
import { sessions } from "../routes/sessionRouter";

async function sendChargingUpdate(body: ChargingUpdateModel) {
  return await fetch("http://backend:3000/charging", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

export async function getDesiredSocWithChargerId(charger_id: number) {
  return await fetch(`http://backend:3000/desired-soc/${charger_id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function startSession(charger_id: number, desired_soc: number) {
  const session = sessions.get(charger_id);

  if (!session) {
    console.error("Session was not found when starting charging");
    return;
  }

  const { rate_of_charge } = session;
  let current_soc = session.current_soc;
  const update: ChargingUpdateModel = {
    charger_id,
    current_soc,
    cumulative_price_of_charge: 0,
    cumulative_power: 0,
  };

  while (update.current_soc < desired_soc) {
    const sessionStillExists = sessions.has(charger_id);
    if (!sessionStillExists) return;

    update.current_soc += rate_of_charge;
    update.cumulative_power += 10;
    update.cumulative_price_of_charge += 1;

    console.log("Sending charge update: ", { update });

    const response = await sendChargingUpdate(update);

    if (!response.ok) {
      console.error(`Remote service error: ${await response.text()}`);
      return;
    }

    await Bun.sleep(1000);
  }
}
