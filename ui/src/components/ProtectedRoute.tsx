import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useStateContext } from "@/contexts/StateContext";
import { useEffect } from "react";
import { notificationService } from "@/services/notifications";

export default function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: "driver" | "restaurant_manager";
}) {
  const { setContextReservation, setContextChargingState, setContextOrder } =
    useStateContext();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user && user.role === "driver") {
      notificationService.subscribe(
        setContextReservation,
        setContextChargingState,
        setContextOrder
      );
    }
  }, [user, setContextReservation]);

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
