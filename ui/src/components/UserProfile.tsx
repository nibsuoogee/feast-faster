import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import axios from "axios";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { }
from "./ui/switch";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { CuisineMultiSelect } from "@/components/CuisinesMultiSelect";
import { AUTH_URL } from "@/lib/urls";
import { Slider } from "./ui/slider";
import { useAuth } from "@/contexts/AuthContext";
import { Car, UtensilsCrossed, LogOut } from "lucide-react";

type UserProfileProps = {
  onLogout: () => void;
};

export function UserProfile({ onLogout }: UserProfileProps) {
  const [userInfo, setUserInfo] = useState<{ username?: string; email?: string } | null>(null);

  const [desiredChargeAtStops, setDesiredChargeAtStops] = useState<number>(80);
  const [evModel, setEvModel] = useState<string>("any");
  const [connectorType, setConnectorType] = useState<string>("any");
  const [cuisinePref, setCuisinePref] = useState<string[]>([]);
  const { settings, updateSettings } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const toast = {
    success: (msg: string) => {
      if (typeof window !== "undefined" && (window as any).toast) {
        (window as any).toast(msg);
      } else {
        alert(msg);
      }
    },
    error: (msg: string) => {
      if (typeof window !== "undefined" && (window as any).toast) {
        (window as any).toast(msg);
      } else {
        alert(msg);
      }
    },
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    (async () => {
      try {
        const res = await axios.get(`${AUTH_URL}/me`);
        setUserInfo(res.data.user || null);
      } catch (err) {
        console.debug("No user info available", err);
      }
    })();
  }, []);

  // Initialize UI fields when settings are loaded/changed
  useEffect(() => {
    if (!settings) return;
    try {
      setEvModel(settings.vehicle_model ?? "any");
      setConnectorType(settings.connector_type ?? "any");
      setDesiredChargeAtStops(settings.desired_soc ?? 80);
      const cuisines = settings.cuisines ?? [];
      setCuisinePref(Array.isArray(cuisines) ? cuisines : []);
    } catch (err) {
      console.error("Failed to apply settings to UI state", err);
    }
  }, [settings]);

  return (
    <div className="min-h-[calc(100vh-120px)] bg-gray-50 pb-4">
      <Card className="m-4 p-6">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="bg-green-600 text-white text-xl">
              {(userInfo?.username || "Guest")
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="mb-1">{userInfo?.username ?? "Guest User"}</h2>
            <p className="text-sm text-gray-600">{userInfo?.email ?? ""}</p>
          </div>
        </div>
      </Card>

      <div className="mx-4 mb-4">
        <div className="grid grid-cols-2 gap-3">
        </div>
      </div>

      <Card className="mx-4 mb-4 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-gray-600" />
            <h3>Your Vehicle</h3>
          </div>
        </div>
        <div className="space-y-2">
          <div className="space-y-2">
            <Label className="text-sm">EV Model</Label>
            <Select value={evModel} onValueChange={setEvModel}>
              <SelectTrigger>
                <SelectValue placeholder="Your EV model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Select</SelectItem>
                <SelectItem value="Skoda">
                  Skoda ...{" "}
                </SelectItem>
                <SelectItem value="VW">
                  Volkswagen ...
                </SelectItem>
                <SelectItem value="Audi">Audi ...</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between mb-2">
              <Label className="text-sm">Desired Charge Level at Stops</Label>
              <span className="text-sm text-green-600">{desiredChargeAtStops}%</span>
            </div>
            <Slider
              value={[desiredChargeAtStops]}
              onValueChange={(v: number[]) => setDesiredChargeAtStops(v[0])}
              min={50}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Connector Type</Label>
            <Select value={connectorType} onValueChange={setConnectorType}>
              <SelectTrigger>
                <SelectValue placeholder="Select connector type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">
                  Connector type
                </SelectItem>
                <SelectItem value="Type 2">Type 2</SelectItem>
                <SelectItem value="CCS">CCS</SelectItem>
                <SelectItem value="CHAdeMO">CHAdeMO</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="mx-4 mb-4 p-4">
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-gray-600" />
            <h3>Your preferences</h3>
          </div>
          <div className="space-y-4">
            <Label className="text-sm">
              Cuisine Preference
            </Label>
            <CuisineMultiSelect value={cuisinePref} onChange={setCuisinePref} />
          </div>
        </div>
      </Card>

      <div className="mx-4 mb-4">
        <Button
          onClick={async () => {
            setIsSaving(true);
            try {
              const body = {
                vehicle_model: evModel || "any",
                connector_type: connectorType || "any",
                desired_soc: desiredChargeAtStops,
                cuisines:
                  !cuisinePref || cuisinePref.length === 0 || cuisinePref.includes("any")
                    ? []
                    : cuisinePref,
              };
              await updateSettings(body);
              toast.success("Preferences saved");
            } catch (err) {
              console.error("Failed to save settings", err);
              toast.error("Failed to save preferences — network error");
            } finally {
              setIsSaving(false);
            }
          }}
          disabled={isSaving}
          className={`w-full bg-green-600 hover:bg-green-700 text-white ${isSaving ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {isSaving ? (
            <span className="flex items-center justify-center w-full">
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Saving...
            </span>
          ) : (
            "Save Vehicle and Cuisine Preference"
          )}
        </Button>
      </div>

      {/* Payment Methods removed per request */}

      <div className="mx-4">
        <Button onClick={onLogout} variant="outline" className="w-full" size="lg">
          <LogOut className="w-5 h-5 mr-2" />
          Log Out
        </Button>
      </div>
    </div>
  );
}
