import { BACKEND_URL } from "@/lib/urls";
import { fetchEventSource } from "@microsoft/fetch-event-source";

export const notificationService = {
  subscribeToNotifications: async () => {
    const token = localStorage.getItem("access_token");

    fetchEventSource(`${BACKEND_URL}/notifications`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      onmessage(ev) {
        console.log("New event:", ev.data);
      },
      onerror(err) {
        console.error("SSE error:", err);
      },
    });
  },
};
