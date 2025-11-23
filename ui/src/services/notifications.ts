import { BACKEND_URL } from "@/lib/urls";
import { reservationModel } from "@/models";
import { ChargingStatus } from "@/types/driver";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { Reservation } from "@types";
import { toast } from "sonner";

export const notificationService = {
  subscribe: async (
    setReservation: (value: Reservation) => void,
    setChargingState: (value: ChargingStatus) => void
  ) => {
    const token = localStorage.getItem("access_token");

    fetchEventSource(`${BACKEND_URL}/notifications`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      onmessage(ev) {
        const data = JSON.parse(ev.data);

        switch (ev.event) {
          case "charging_started":
            setChargingState("active");
            toast.info("Your vehicle is now charging");
            console.log("Charging was started");
            break;
          case "charging_stopped":
            setChargingState("finished");
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
          case "reservation_shift_success":
            toast.info(
              "Your reservation was successfully postponed by 5 minutes."
            );
            console.log("Reservation postponed by 5 minutes.");
            break;
          case "reservation_shift_not_allowed":
            toast.info("Your reservation cannot be postponed.");
            console.log("Reservation cannot be postponed.");
            break;
          case "reservation_extension_success":
            toast.success("Your reservation is successfully extended by 10 minutes.");
            console.log("Reservation extended by 10 minutes");
            break;
          case "reservation_extension_not_allowed":
            toast.info("Your reservation cannot be extended.");
            console.log("Reservation cannot be extended.");
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
