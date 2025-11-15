import { BACKEND_URL } from "@/lib/urls";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { toast } from "sonner";

export const notificationService = {
  subscribe: async () => {
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
