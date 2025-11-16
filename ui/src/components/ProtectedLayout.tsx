import { useStateContext } from "@/contexts/StateContext";
import { notificationService } from "@/services/notifications";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";

export default function ProtectedLayout() {
  const { setContextReservation } = useStateContext();

  useEffect(() => {
    notificationService.subscribe(setContextReservation);
  });
  return (
    <div>
      {/* Add shared layout if needed */}
      <Outlet />
    </div>
  );
}
