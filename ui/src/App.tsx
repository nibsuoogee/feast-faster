import axios from "axios";
import { useEffect } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { StateProvider } from "./contexts/StateContext";
import { Home } from "./pages/home";
import { Landing } from "./pages/landing";
import { Login } from "./pages/login";
import { Register } from "./pages/register";
import RestaurantDashboard from "./pages/restaurant-dashboard";

function App() {
  useEffect(() => {
    // Add request interceptor to add token to all requests
    axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor to handle unauthorized errors
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // If unauthorized, clear token and redirect to login
          localStorage.removeItem("access_token");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }, []);

  return (
    <>
      <Toaster />
      <Router>
        <AuthProvider>
          <StateProvider>
            <Routes>
              {/* Public routes — no context */}
              <Route path="/" element={<Landing />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />

              {/* Driver routes */}
              <Route
                path="/home"
                element={
                  <ProtectedRoute requiredRole="driver">
                    <Home />
                  </ProtectedRoute>
                }
              />

              {/* Restaurant Manager routes */}
              <Route
                path="/restaurant"
                element={
                  <ProtectedRoute requiredRole="restaurant_manager">
                    <RestaurantDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </StateProvider>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
