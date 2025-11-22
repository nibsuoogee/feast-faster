import { ChargingSession } from "@/components/ChargingSession";
import { CuisineMultiSelect } from "@/components/CuisinesMultiSelect";
import { RoutePreview } from "@/components/RoutePreview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserProfile } from "@/components/UserProfile";
import { useAuth } from "@/contexts/AuthContext";
import { geocodeAddress, useUserLocation } from "@/services/geocode";
import { getFilteredStations } from "@/services/stations";
import {
  ChargingSessionType,
  PlannedJourney,
  RestaurantOrder,
} from "@/types/driver";
import { StationModel } from "@types";
import {
  Battery,
  ChevronDown,
  ChevronUp,
  MapPin,
  Navigation,
  Route as RouteIcon,
  SlidersHorizontal,
  User,
  UtensilsCrossed,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Home = () => {
  const { settings, logout } = useAuth();
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
  // const [stations, setStations] = useState<StationModel | undefined>(undefined);
  const [connectorType, setConnectorType] = useState<string>("any");
  const [cuisinePreference, setCuisinePreference] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [endLocation, setEndLocation] = useState("");
  const [isPlanning, setIsPlanning] = useState(false);

  // Current user location
  const currentUserLocation = useUserLocation();

  useEffect(() => {
    if (!settings) return;

    setDesiredSOC([settings.desired_soc ?? 80]);
    setConnectorType(settings.connector_type ?? "any");
    setCuisinePreference(settings.cuisines ?? []);
  }, [settings]);

  const handlePlanRoute = async () => {
    if (!endLocation) return;

    const destinationLocation = await geocodeAddress(endLocation);

    setIsPlanning(true);

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
        ev_model: settings.vehicle_model,
        current_car_range: currentRange[0],
        current_soc: currentSOC[0] || 50,
        desired_soc: desiredSOC[0] || 80,
        connector_type: connectorType,
        cuisines: cuisinePreference,
      };

      const stations = await getFilteredStations(body);

      if (!stations) {
        console.log("Could not fetch stations from API");
        return;
      }

      if (stations.length > 0) {
        const journey: PlannedJourney = {
          id: Date.now().toString(),
          startLocation: currentUserLocation.address || "Lahti",
          endLocation: destinationLocation.address || endLocation,
          stops: stations.map((station) => ({
            station,
            estimatedArrivalTime: new Date(
              Date.now() + station.travel_time_min * 60 * 1000
            ),
            socAtArrival: station.soc_at_arrival,
            chargingDuration: station.estimate_charging_time_min,
            distanceFromStart: station.distance_km,
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

  const startChargingSession = (station: StationModel) => {
    const session: ChargingSessionType = {
      id: Date.now().toString(),
      station_id: station.station_id,
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
                // onStartCharging={startChargingSession}
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
