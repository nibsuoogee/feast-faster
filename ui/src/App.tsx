import ProtectedLayout from "@/components/ProtectedLayout";
import axios from "axios";
import { useEffect } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
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
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes — no context */}
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Protected route group */}
          <Route
            element={
              <ProtectedRoute>
                <ProtectedLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/home" element={<Home />} />
          </Route>

          {/* Restaurant Dashboard - Protected route */}
          <Route
            path="/restaurant"
            element={
              <ProtectedRoute>
                <RestaurantDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
