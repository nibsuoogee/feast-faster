// Journey Planner on Home Page
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
  Route,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Battery,
  Zap,
  UtensilsCrossed,
} from "lucide-react";

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
  id: string;
  name: string;
  cuisine: string[];
  prepTime: string;
  image: string;
  menu: MenuItem[];
};

export type ChargingStation = {
  id: string;
  name: string;
  address: string;
  distance: number;
  availableChargers: number;
  totalChargers: number;
  chargerTypes: ("Type 2" | "CCS" | "ChaDeMo")[];
  pricePerKwh: number;
  lat: number;
  lng: number;
  restaurants: Restaurant[];
};

export type JourneyStop = {
  station: ChargingStation;
  estimatedArrivalTime: Date;
  chargingDuration: number;
  distanceFromStart: number;
  selectedRestaurantId?: string;
  isSelected: boolean;
};

export type PlannedJourney = {
  id: string;
  startLocation: string;
  endLocation: string;
  totalDistance: number;
  estimatedDuration: number;
  stops: JourneyStop[];
  createdAt: Date;
};

export type ChargingSessionType = {
  id: string;
  stationId: string;
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
  
  // Mock stations data - replace with API call later
  const [stations] = useState<ChargingStation[]>([]);
  
  // User's current location
  const currentLocation = "Helsinki central station";

  const [endLocation, setEndLocation] = useState("");
  const [isPlanning, setIsPlanning] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [plannedJourney, setPlannedJourney] = useState<PlannedJourney | null>(null);

  // Filter states
  const [currentSOC, setCurrentSOC] = useState([75]);
  const [currentRange, setCurrentRange] = useState([180]);
  const [connectorType, setConnectorType] = useState<string>("any");
  const [desiredSOC, setDesiredSOC] = useState([80]);
  const [cuisinePreference, setCuisinePreference] = useState<string>("any");

  const handlePlanRoute = () => {
    if (!endLocation) return;

    setIsPlanning(true);

    setTimeout(() => {
      const totalDistance = Math.floor(Math.random() * 200) + 100;
      const estimatedDuration = Math.floor((totalDistance / 60) * 60);

      let filteredStations = stations;

      if (connectorType !== "any") {
        filteredStations = filteredStations.filter((station) =>
          station.chargerTypes.includes(connectorType as any)
        );
      }

      if (cuisinePreference !== "any") {
        filteredStations = filteredStations.filter((station) =>
          station.restaurants.some((restaurant) => {
            const cuisineLower = restaurant.cuisine[0].toLowerCase();
            const prefLower = cuisinePreference.toLowerCase();
            if (prefLower === "american") return cuisineLower.includes("american");
            if (prefLower === "asian") return cuisineLower.includes("asian");
            if (prefLower === "vegetarian") return cuisineLower.includes("vegetarian");
            if (prefLower === "italian") return cuisineLower.includes("italian");
            if (prefLower === "japanese") return cuisineLower.includes("japanese") || cuisineLower.includes("sushi");
            if (prefLower === "coffee") return cuisineLower.includes("coffee") || cuisineLower.includes("cafe");
            if (prefLower === "international") return cuisineLower.includes("international");
            return false;
          })
        );
      }

      const selectedStations = filteredStations;

      const stops: JourneyStop[] = selectedStations.map((station) => {
        const distanceFromStart = 30;
        const timeFromStart = Math.floor((distanceFromStart / 60) * 60);
        const baseChargingTime = 20;
        const socMultiplier = desiredSOC[0] / 80;
        const calculatedDuration = Math.floor(baseChargingTime * socMultiplier + Math.random() * 15);

        return {
          station,
          estimatedArrivalTime: new Date(Date.now() + timeFromStart * 60000),
          chargingDuration: Math.min(calculatedDuration, 60),
          distanceFromStart,
          isSelected: false,
        };
      });

      const journey: PlannedJourney = {
        id: Date.now().toString(),
        startLocation: currentLocation,
        endLocation,
        totalDistance,
        estimatedDuration,
        stops,
        createdAt: new Date(),
      };

      setPlannedJourney(journey);
      setIsPlanning(false);
    }, 1500);
  };

  return (
    <div className="min-h-[calc(100vh-120px)] bg-gray-50">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Route className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold">Plan Your Journey</h2>
          </div>
          <Button
            onClick={logout}
            className="bg-green-600 hover:bg-green-700"
            size="sm"
          >
            Logout
          </Button>
        </div>
        <p className="text-gray-600">
          Plan your trip with charging stops and pre-order meals along the way
        </p>

        {/* Active Filters Summary */}
        {(connectorType !== "any" ||
          cuisinePreference !== "any" ||
          currentSOC[0] !== 75 ||
          currentRange[0] !== 180 ||
          desiredSOC[0] !== 80) && (
          <div className="flex flex-wrap gap-2">
            {currentSOC[0] !== 75 && (
              <Badge variant="outline" className="bg-blue-50">
                <Battery className="w-3 h-3 mr-1" />
                Battery: {currentSOC[0]}%
              </Badge>
            )}
            {currentRange[0] !== 180 && (
              <Badge variant="outline" className="bg-blue-50">
                Range: {currentRange[0]} km
              </Badge>
            )}
            {desiredSOC[0] !== 80 && (
              <Badge variant="outline" className="bg-blue-50">
                Target: {desiredSOC[0]}%
              </Badge>
            )}
            {connectorType !== "any" && (
              <Badge variant="outline" className="bg-green-50">
                <Zap className="w-3 h-3 mr-1" />
                {connectorType}
              </Badge>
            )}
            {cuisinePreference !== "any" && (
              <Badge variant="outline" className="bg-orange-50">
                <UtensilsCrossed className="w-3 h-3 mr-1" />
                {cuisinePreference.charAt(0).toUpperCase() + cuisinePreference.slice(1)}
              </Badge>
            )}
          </div>
        )}

        {/* Filters */}
        <Card className="p-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-green-600" />
              <span className="font-medium">Journey Preferences</span>
            </div>
            {showFilters ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {showFilters && (
            <div className="mt-4 space-y-4">
              <Separator />

              {/* Battery & Range Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Battery className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600">Battery & Range</span>
                </div>

                {/* Current SOC */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm">Current Battery Level</Label>
                    <span className="text-sm text-green-600">{currentSOC[0]}%</span>
                  </div>
                  <Slider
                    value={currentSOC}
                    onValueChange={setCurrentSOC}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full [&_[data-slot=slider-range]]:bg-green-600"
                  />
                </div>

                {/* Current Range */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm">Current Range</Label>
                    <span className="text-sm text-green-600">{currentRange[0]} km</span>
                  </div>
                  <Slider
                    value={currentRange}
                    onValueChange={setCurrentRange}
                    min={0}
                    max={400}
                    step={10}
                    className="w-full [&_[data-slot=slider-range]]:bg-green-600"
                  />
                </div>

                {/* Desired SOC */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm">Desired Charge Level at Stops</Label>
                    <span className="text-sm text-green-600">{desiredSOC[0]}%</span>
                  </div>
                  <Slider
                    value={desiredSOC}
                    onValueChange={setDesiredSOC}
                    min={50}
                    max={100}
                    step={5}
                    className="w-full [&_[data-slot=slider-range]]:bg-green-600"
                  />
                </div>
              </div>

              <Separator />

              {/* Charging Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Zap className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600">Charging</span>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Connector Type</Label>
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
                      <SelectItem value="ChaDeMo">ChaDeMo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Cuisine Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <UtensilsCrossed className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600">Food Preferences</span>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Cuisine Preference</Label>
                  <Select
                    value={cuisinePreference}
                    onValueChange={setCuisinePreference}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cuisine" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Cuisine</SelectItem>
                      <SelectItem value="american">American</SelectItem>
                      <SelectItem value="asian">Asian</SelectItem>
                      <SelectItem value="healthy">Vegetarian</SelectItem>
                      <SelectItem value="italian">Italian</SelectItem>
                      <SelectItem value="japanese">Japanese</SelectItem>
                      <SelectItem value="coffee">Coffee & Pastries</SelectItem>
                      <SelectItem value="international">International</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setCurrentSOC([75]);
                  setCurrentRange([180]);
                  setConnectorType("any");
                  setDesiredSOC([80]);
                  setCuisinePreference("any");
                }}
              >
                Reset Filters
              </Button>
            </div>
          )}
        </Card>

        {/* Route Input */}
        <Card className="p-4 space-y-4">
          {/* Current Location */}
          <div className="space-y-2">
            <Label>Your Current Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-600" />
              <div className="pl-9 pr-4 py-2 bg-green-50 border border-green-200 rounded-md text-sm">
                {currentLocation}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="end">Where are you going?</Label>
            <div className="relative">
              <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="end"
                placeholder="Enter destination..."
                value={endLocation}
                onChange={(e) => setEndLocation(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Button
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
            onClick={handlePlanRoute}
            disabled={!endLocation || isPlanning}
          >
            {isPlanning ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Planning Route...
              </>
            ) : (
              <>
                <Route className="w-5 h-5 mr-2" />
                Plan My Route
              </>
            )}
          </Button>
        </Card>

        {/* Journey Result */}
        {plannedJourney && (
          <Card className="p-4 space-y-3">
            <h3 className="font-semibold">Planned Journey</h3>
            <div className="text-sm space-y-1">
              <p><strong>From:</strong> {plannedJourney.startLocation}</p>
              <p><strong>To:</strong> {plannedJourney.endLocation}</p>
              <p><strong>Distance:</strong> {plannedJourney.totalDistance} km</p>
              <p><strong>Duration:</strong> {Math.floor(plannedJourney.estimatedDuration / 60)}h {plannedJourney.estimatedDuration % 60}m</p>
              <p><strong>Stops:</strong> {plannedJourney.stops.length}</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
