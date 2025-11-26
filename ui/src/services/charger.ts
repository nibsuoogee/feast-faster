import { handleApiRequest } from "@/lib/requests";
import { CHARGER_URL } from "@/lib/urls";
import axios from "axios";
import z from "zod";

export const startChargingRequest = z.object({
  charger_id: z.number(),
  user_id: z.number(),
  current_soc: z.number(),
  rate_of_charge: z.number(),
});
export type StartChargingRequest = z.infer<typeof startChargingRequest>;

export const chargingService = {
  startCharging: async (chargingRequest: StartChargingRequest) => {
    return handleApiRequest<undefined>(() =>
      axios.post(`${CHARGER_URL}/start-charging`, chargingRequest, {})
    );
  },
};
