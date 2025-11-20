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

        switch (ev.event) {
          case "charging_started":
            toast.info("Your vehicle is now charging");
            console.log("Charging was started");
            break;
          case "charging_stopped":
            toast.info("Your vehicle is no longer charging");
            console.log("Charging has ended");
            break;
          case "reservation_data":
            const result = reservationModel.safeParse(data.reservation);
            if (!result.success) {
              console.error("Failed to parse reservation: ", result.error);
            } else {
              console.log("reservation: ", result.data);
              setReservation(result.data);
            }
            break;
          case "food_status":
            toast.info(data.message);
            console.log("Food status update: ", data.message);
            break;
          case "charging_paid":
            toast.info("Your charging session was succesfully paid.");
            console.log("Charging payment successful.");
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
