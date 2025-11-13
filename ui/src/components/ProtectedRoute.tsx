import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth();

  // Check if we're in development mode and auth bypass is enabled
  const isDevelopment = import.meta.env.DEV;
  const bypassAuth = import.meta.env.VITE_BYPASS_AUTH === 'true';

  if (isDevelopment && bypassAuth) {
    console.warn("⚠️ Development Mode: Authentication is bypassed!");
    return <>{children}</>;
  }

  //Show a loading state while checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Render the children (the protected component)
  return <>{children}</>;
};

export default ProtectedRoute;
