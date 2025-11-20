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
  const { setContextReservation } = useStateContext();
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    if (user.role === "driver") {
      notificationService.subscribe(setContextReservation);
    }
  });

  return <>{children}</>;
}
