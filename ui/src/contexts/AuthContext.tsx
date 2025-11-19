// ui/src/contexts/AuthContext.tsx

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import axios from "axios";
import { BACKEND_URL } from "@/lib/urls";

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string) => void;
  registerAccount: (token: string) => void;
  logout: () => void;
  settings: any | null;
  loadSettings: () => Promise<void>;
  updateSettings: (body: any) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any | null>(null);
  // BACKEND_URL is imported from client-side helper

  useEffect(() => {
    // Check if there's a token in localStorage on initial load
    const token = localStorage.getItem("access_token");

    if (token) {
      // Set the token as the default Authorization header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setIsAuthenticated(true);
      // Load settings for existing session
      loadSettings().catch((err) => console.debug("loadSettings error", err));
    }

    setLoading(false);
  }, []);

  const login = (token: string) => {
    // Store the token in localStorage
    localStorage.setItem("access_token", token);

    // Set the token as the default Authorization header
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    setIsAuthenticated(true);
    // Load user settings after login
    loadSettings().catch((err) => console.debug("loadSettings error", err));
  };

  const registerAccount = (token: string) => {
    // Use the same implementation as login
    login(token);
  };

  const loadSettings = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/settings`);
      setSettings(res.data.settings);
    } catch (err: any) {
      // If not found or other error, attempt to create defaults
      try {
        const defaultBody = {
          vehicle_model: "any",
          connector_type: "Type 2",
          desired_soc: 80,
          cuisines: [],
        };
        const createRes = await axios.post(`${BACKEND_URL}/settings`, defaultBody);
        setSettings(createRes.data.settings);
      } catch (err2) {
        console.error("Failed to load or create settings", err2);
      }
    }
  };

  const updateSettings = async (body: any) => {
    try {
      const res = await axios.patch(`${BACKEND_URL}/settings`, body);
      setSettings(res.data.settings ?? res.data);
      return res.data;
    } catch (err) {
      console.error("Failed to update settings", err);
      throw err;
    }
  };

  const logout = () => {
    // Remove the token from localStorage
    localStorage.removeItem("access_token");

    // Remove the Authorization header
    delete axios.defaults.headers.common["Authorization"];

    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, loading, login, registerAccount, logout, settings, loadSettings, updateSettings }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
