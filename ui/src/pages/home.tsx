import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ChargingSession } from "@/components/ChargingSession";
import { UserProfile } from "@/components/UserProfile";
import { RoutePreview } from "@/components/RoutePreview";
import { CuisineMultiSelect } from "@/components/CuisinesMultiSelect";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { FC } from "react";
import { Route as RouteIcon, Zap, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Navigation,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Battery,
  UtensilsCrossed,
} from "lucide-react";
import { getFilteredStations } from "@/services/stations";
import { useUserLocation, geocodeAddress } from "@/services/geocode";

const Toaster: FC<{ position?: string }> = () => null;
const toast = {
  error: (msg: string) => {
    if (typeof window !== "undefined") {
      console.error(msg);
      try {
        alert(msg);
      } catch {}
    } else {
      console.error(msg);
    }
  },
};

// Types
export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  prepTime: number;
};

export type Restaurant = {
  id: number;
  name: string;
  cuisine: string[];
  prepTime: string;
  menu: MenuItem[];
};

export type ChargingStation = {
  id: number;
  name: string;
  address: string;
  distance: number;
  travelTimeMin: number;
  availableChargers: number;
  totalChargers: number;
  chargerTypes: ("Type 2" | "CCS" | "CHAdeMO")[];
  restaurants: Restaurant[];
  socAtArrival: number;
  estimateChargingTimeMin: number;
};

export type JourneyStop = {
  station: ChargingStation;
  estimatedArrivalTime: Date;
  socAtArrival: number;
  chargingDuration: number;
  distanceFromStart: number;
  selectedRestaurantId?: number;
  isSelected: boolean;
};

export type PlannedJourney = {
  id: string;
  startLocation: string;
  endLocation: string;
  stops: JourneyStop[];
  createdAt: Date;
};

export type ChargingSessionType = {
  id: string;
  stationId: number;
  stationName: string;
  startTime: Date;
  endTime?: Date;
  energyDelivered: number;
  cost: number;
  status: "active" | "completed";
};

export type RestaurantOrder = {
  id: string;
  restaurantId: string;
  restaurantName: string;
  stationId: string;
  stationName: string;
  items: { menuItem: MenuItem; quantity: number }[];
  totalCost: number;
  status: "pending" | "cooking" | "ready" | "completed";
  orderTime: Date;
  pickupTime?: Date;
  isPaid: boolean;
};

export const Home = () => {
  const { logout } = useAuth();
  const [currentTab, setCurrentTab] = useState("journey");
  const [activeSession, setActiveSession] =
    useState<ChargingSessionType | null>(null);
  const [restaurantOrders, setRestaurantOrders] = useState<RestaurantOrder[]>(
    []
  );
  const [plannedJourney, setPlannedJourney] = useState<PlannedJourney | null>(
    null
  );
  const [showRoutePreview, setShowRoutePreview] = useState(false);
  const [isJourneyActive, setIsJourneyActive] = useState(false);

  // Journey Planner state
  const [currentSOC, setCurrentSOC] = useState([75]);
  const [currentRange, setCurrentRange] = useState([180]);
  const [desiredSOC, setDesiredSOC] = useState([80]);
  const [, setDemoStations] = useState<any[] | null>(null);
  const [connectorType, setConnectorType] = useState<string>("any");
  const [cuisinePreference, setCuisinePreference] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [endLocation, setEndLocation] = useState("");
  const [isPlanning, setIsPlanning] = useState(false);

  // Current user location
  const currentUserLocation = useUserLocation();

  const handlePlanRoute = async () => {
    if (!endLocation) return;

    const destinationLocation = await geocodeAddress(endLocation);

    setIsPlanning(true);

    // For API restaurants we don't have menus in the response.
    // Instead of attempting to match, attach a small static menu here so the UI can show orders.
    const staticMenuForApiRestaurant = (apiR: any): MenuItem[] => {
      const base = String(apiR?.name || "Restaurant")
        .replace(/[^a-z0-9]/gi, "")
        .toLowerCase();
      return [
        {
          id: `${base}-m1`,
          name: "Chef's Special",
          description: "House specialty with seasonal ingredients",
          price: 12.99,
          category: "Mains",
          prepTime: 15,
        },
        {
          id: `${base}-m2`,
          name: "Quick Snack",
          description: "Light bite for the road",
          price: 6.5,
          category: "Snacks",
          prepTime: 5,
        },
        {
          id: `${base}-m3`,
          name: "Coffee",
          description: "Freshly brewed coffee",
          price: 3.5,
          category: "Beverages",
          prepTime: 3,
        },
      ];
    };

    // Map API station shape to our local ChargingStation type
    const mapApiStationToChargingStation = (s: any): ChargingStation => {
      const chargers = Array.isArray(s.chargers) ? s.chargers : [];
      const chargerTypes = Array.from(
        new Set(
          chargers.map((c: any) => {
            if (!c || !c.type) return "Type 2";
            const t = String(c.type).toLowerCase();
            if (t.includes("chademo")) return "CHAdeMO" as any;
            if (t.includes("ccs")) return "CCS" as any;
            return c.type;
          })
        )
      );

      const availableChargers = chargers.filter(
        (c: any) => c.status === "available"
      ).length;
      const totalChargers = chargers.length;

      const restaurants = Array.isArray(s.restaurants)
        ? s.restaurants.map((r: any) => ({
            id: r.restaurant_id,
            name: r.name,
            cuisine: r.cuisines,
            prepTime: "15-25 min",
            menu: staticMenuForApiRestaurant(r), // attach small static menu so ordering UI works
          }))
        : [];

      return {
        id: s.station_id,
        name: s.name,
        address: s.address,
        distance: s.distance_km,
        availableChargers,
        totalChargers,
        chargerTypes: chargerTypes as any,
        restaurants,
        travelTimeMin: s.travel_time_min,
        socAtArrival: s.soc_at_arrival,
        estimateChargingTimeMin: s.estimate_charging_time_min,
      };
    };

    try {
      let stations: any[] = [];

      try {
        const body = {
          current_location: [
            currentUserLocation.longitude,
            currentUserLocation.latitude,
          ] as [number, number],
          destination: [
            destinationLocation.longitude,
            destinationLocation.latitude,
          ] as [number, number],
          ev_model: "Nissan Leaf", // Get from settings
          current_car_range: 120, // Get from settings
          current_soc: currentSOC[0] || 50,
          desired_soc: desiredSOC[0] || 80,
          connector_type: connectorType,
          cuisines: cuisinePreference,
        };

        const data = await getFilteredStations(body);

        stations = Array.isArray(data?.stations) ? data.stations : [];
        setDemoStations(stations);
      } catch (err) {
        console.log("Could not fetch stations from API", err);
      }

      const filteredStations: ChargingStation[] = stations.map(
        mapApiStationToChargingStation
      );

      if (filteredStations.length > 0) {
        const journey: PlannedJourney = {
          id: Date.now().toString(),
          startLocation: currentUserLocation.address || "Lahti",
          endLocation: destinationLocation.address || endLocation,
          stops: filteredStations.map((station) => ({
            station,
            estimatedArrivalTime: new Date(
              Date.now() + station.travelTimeMin * 60 * 1000
            ),
            socAtArrival: station.socAtArrival,
            chargingDuration: station.estimateChargingTimeMin,
            distanceFromStart: station.distance,
            isSelected: false,
          })),
          createdAt: new Date(),
        };

        console.log("Journey created:", journey);
        setPlannedJourney(journey);
        setShowRoutePreview(true);
      } else {
        console.log("No stations found matching criteria");
        toast.error(
          "No charging stations found matching your criteria. Try adjusting your filters."
        );
      }
    } finally {
      setIsPlanning(false);
    }
  };

  // demo fetch button removed; Plan My Route will fetch API automatically when needed

  const startChargingSession = (station: ChargingStation) => {
    const session: ChargingSessionType = {
      id: Date.now().toString(),
      stationId: station.id,
      stationName: station.name,
      startTime: new Date(),
      energyDelivered: 0,
      cost: 0,
      status: "active",
    };
    setActiveSession(session);
    setCurrentTab("session");
  };

  const endChargingSession = () => {
    if (activeSession) {
      setActiveSession({
        ...activeSession,
        endTime: new Date(),
        status: "completed",
      });
      setTimeout(() => setActiveSession(null), 2000);
    }
  };

  const placeRestaurantOrder = (order: RestaurantOrder) => {
    setRestaurantOrders((prev) => [...prev, order]);
  };

  const updateOrderStatus = (
    orderId: string,
    status: RestaurantOrder["status"]
  ) => {
    setRestaurantOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status } : order))
    );
  };

  const startJourney = () => {
    setIsJourneyActive(true);
    setShowRoutePreview(false);
    setCurrentTab("session");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Toaster position="top-center" />

      <main className="h-full">
        {showRoutePreview && plannedJourney ? (
          <RoutePreview
            journey={plannedJourney}
            onStartJourney={startJourney}
            onPlaceOrder={placeRestaurantOrder}
            onBack={() => setShowRoutePreview(false)}
          />
        ) : (
          <Tabs
            value={currentTab}
            onValueChange={setCurrentTab}
            className="w-full"
          >
            <TabsContent value="journey" className="m-0">
              {/* Journey Planner Content */}
              <div className="p-4 space-y-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <RouteIcon className="w-6 h-6 text-green-600" />
                      <h2 className="text-xl font-semibold">
                        Plan Your Journey
                      </h2>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Plan your trip with charging stops and pre-order meals along
                    the way
                  </p>

                  {/* Active Filters Summary - Always visible */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className="bg-blue-50">
                      <Battery className="w-3 h-3 mr-1" />
                      Current: {currentSOC[0]}%
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50">
                      <Navigation className="w-3 h-3 mr-1" />
                      Range: {currentRange[0]} km
                    </Badge>
                    <Badge variant="outline" className="bg-green-50">
                      <Zap className="w-3 h-3 mr-1" />
                      Target: {desiredSOC[0]}%
                    </Badge>
                    {connectorType !== "any" && (
                      <Badge variant="outline" className="bg-purple-50">
                        <Zap className="w-3 h-3 mr-1" />
                        {connectorType}
                      </Badge>
                    )}
                    {cuisinePreference.length > 0 &&
                      cuisinePreference.map((c) => (
                        <Badge
                          key={c}
                          variant="outline"
                          className="bg-orange-50"
                        >
                          <UtensilsCrossed className="w-3 h-3 mr-1" />
                          {c[0].toUpperCase() + c.slice(1)}
                        </Badge>
                      ))}
                  </div>

                  {/* Filters Toggle */}
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="w-full mb-4 justify-start"
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-2 text-green-600" />
                    <span className="flex-1 text-left">
                      Journey Preferences
                    </span>
                    {showFilters ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>

                  {/* Filters */}
                  {showFilters && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg mb-4">
                      {/* Battery & Range */}
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <Label className="flex items-center gap-2">
                              <Battery className="w-4 h-4" />
                              Current Battery
                            </Label>
                            <span className="text-sm text-gray-600">
                              {currentSOC[0]}%
                            </span>
                          </div>
                          <Slider
                            value={currentSOC}
                            onValueChange={setCurrentSOC}
                            min={20}
                            max={100}
                            step={5}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <Label className="flex items-center gap-2">
                              <Navigation className="w-4 h-4" />
                              Current Range
                            </Label>
                            <span className="text-sm text-gray-600">
                              {currentRange[0]} km
                            </span>
                          </div>
                          <Slider
                            value={currentRange}
                            onValueChange={setCurrentRange}
                            min={50}
                            max={500}
                            step={10}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <Label className="flex items-center gap-2">
                              <Zap className="w-4 h-4" />
                              Desired Charge at Stops
                            </Label>
                            <span className="text-sm text-green-600">
                              {desiredSOC[0]}%
                            </span>
                          </div>
                          <Slider
                            value={desiredSOC}
                            onValueChange={setDesiredSOC}
                            min={50}
                            max={100}
                            step={5}
                            className="w-full"
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* Connector Type */}
                      <div className="space-y-2">
                        <Label>Connector Type</Label>
                        <Select
                          value={connectorType}
                          onValueChange={setConnectorType}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select connector type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any Connector</SelectItem>
                            <SelectItem value="Type 2">Type 2</SelectItem>
                            <SelectItem value="CCS">CCS</SelectItem>
                            <SelectItem value="CHAdeMO">CHAdeMO</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Cuisine Preference */}
                      <div className="space-y-2">
                        <Label>Cuisine Preference</Label>
                        <CuisineMultiSelect
                          value={cuisinePreference}
                          onChange={setCuisinePreference}
                        />
                      </div>
                    </div>
                  )}

                  {/* Route Inputs */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                      <Navigation className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs text-gray-500">
                          Current Location
                        </div>
                        <div className="font-medium">
                          {currentUserLocation?.address}
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Destination"
                        value={endLocation}
                        onChange={(e) => setEndLocation(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 mt-0"
                      size="lg"
                      onClick={handlePlanRoute}
                      disabled={
                        !endLocation ||
                        connectorType === "any" ||
                        cuisinePreference.length === 0 ||
                        isPlanning
                      }
                    >
                      {isPlanning ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Planning Route...
                        </>
                      ) : (
                        <>
                          <RouteIcon className="w-5 h-5 mr-2" />
                          Plan My Route
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="session" className="m-0">
              <ChargingSession
                activeSession={activeSession}
                onEndSession={endChargingSession}
                restaurantOrders={restaurantOrders}
                onUpdateOrderStatus={updateOrderStatus}
                isJourneyActive={isJourneyActive}
                plannedJourney={plannedJourney}
                onStartCharging={startChargingSession}
              />
            </TabsContent>

            <TabsContent value="profile" className="m-0">
              <UserProfile onLogout={logout} />
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Bottom Navigation */}
      {!showRoutePreview && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
          <Tabs
            value={currentTab}
            onValueChange={setCurrentTab}
            className="w-full"
          >
            <TabsList className="w-full h-16 grid grid-cols-3 rounded-none bg-white">
              <TabsTrigger
                value="journey"
                className="flex flex-col gap-1 data-[state=active]:text-green-600 relative"
              >
                <RouteIcon className="w-5 h-5" />
                <span className="text-xs">Journey</span>
                {isJourneyActive && (
                  <span className="absolute top-2 right-3 w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="session"
                className="flex flex-col gap-1 data-[state=active]:text-green-600 relative"
              >
                <Zap className="w-5 h-5" />
                <span className="text-xs">Active</span>
                {(activeSession?.status === "active" ||
                  restaurantOrders.some((o) =>
                    ["pending", "cooking", "ready"].includes(o.status)
                  )) && (
                  <span className="absolute top-2 right-3 w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="flex flex-col gap-1 data-[state=active]:text-green-600"
              >
                <User className="w-5 h-5" />
                <span className="text-xs">Settings</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </nav>
      )}
    </div>
  );
};
