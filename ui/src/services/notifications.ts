import { BACKEND_URL } from "@/lib/urls";
import { reservationModel } from "@/models";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { Reservation } from "@types";
import { toast } from "sonner";

export const notificationService = {
  subscribe: async (setReservation: (value: Reservation) => void) => {
    const token = localStorage.getItem("access_token");

    fetchEventSource(`${BACKEND_URL}/notifications`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      onmessage(ev) {
        const data = JSON.parse(ev.data);

        switch (data.message) {
          case "Charging started":
            toast.info("Your vehicle is now charging");
            console.log("Charging was started");
            break;
          case "Charging stopped":
            toast.info("Your vehicle is no longer charging");
            console.log("Charging has ended");
            break;
          case "reservation":
            const result = reservationModel.safeParse(data.reservation);
            if (!result.success) {
              console.error("Failed to parse reservation: ", result.error);
            } else {
              console.log("reservation: ", result.data);
              setReservation(result.data);
            }
            break;
          default:
            break;
        }
      },
      onerror(err) {
        console.error("SSE error:", err);
      },
    });
  },
};
