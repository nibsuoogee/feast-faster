import { useStateContext } from "@/contexts/StateContext";
import { notificationService } from "@/services/notifications";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";

export default function ProtectedLayout() {
  const { setContextReservation, setContextChargingState, setContextOrder } =
    useStateContext();

  useEffect(() => {
    notificationService.subscribe(
      setContextReservation,
      setContextChargingState,
      setContextOrder
    );
  });

  return (
    <div>
      {/* Add shared layout if needed */}
      <Outlet />
    </div>
  );
}
