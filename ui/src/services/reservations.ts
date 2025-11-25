import { handleApiRequest } from "@/lib/requests";
import { BACKEND_URL } from "@/lib/urls";
import axios from "axios";

export const reservationService = {
  canExtendReservation: async (reservationId: number) => {
    return handleApiRequest<{ can_extend: boolean }>(() =>
      axios.get(`${BACKEND_URL}/reservations/can-extend/${reservationId}`)
    );
  },

  finishCharging: async (chargerId: number) => {
    return handleApiRequest<string>(() =>
      axios.post(`${BACKEND_URL}/finish-charging`, {
        charger_id: chargerId,
      })
    );
  },
};
