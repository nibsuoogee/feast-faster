import { useState } from "react";
import { ChargingStation } from "../App";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Slider } from "./ui/slider";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import {
  MapPin,
  Navigation,
  ArrowRight,
  Route,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Battery,
  Zap,
  UtensilsCrossed,
} from "lucide-react";

export type JourneyStop = {
  station: ChargingStation;
  estimatedArrivalTime: Date;
  chargingDuration: number; // minutes
  distanceFromStart: number; // miles - should be km
  selectedRestaurantId?: string;
  isSelected: boolean; // Whether user has confirmed this stop
};

export type PlannedJourney = {
  id: string;
  startLocation: string;
  endLocation: string;
  totalDistance: number;
  estimatedDuration: number; // minutes
  stops: JourneyStop[]; // Filtered and offered stops
  createdAt: Date;
};

type JourneyPlannerProps = {
  stations: ChargingStation[];
  onPlanJourney: (journey: PlannedJourney) => void;
  onViewRoute: (journey: PlannedJourney) => void;
};

export function JourneyPlanner({
  stations,
  onPlanJourney,
  onViewRoute,
}: JourneyPlannerProps) {
  // User's current location (simulated - in real app this would come from GPS/location services)
  const currentLocation = "Helsinki central station";

  const [endLocation, setEndLocation] = useState("");
  const [isPlanning, setIsPlanning] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [currentSOC, setCurrentSOC] = useState([75]); // Current battery percentage
  const [currentRange, setCurrentRange] = useState([180]); // Miles - should be km
  const [connectorType, setConnectorType] =
    useState<string>("any");
  const [desiredSOC, setDesiredSOC] = useState([80]); // Target charge percentage
  const [cuisinePreference, setCuisinePreference] =
    useState<string>("any");

  const handlePlanRoute = () => {
    if (!endLocation) return;

    setIsPlanning(true);

    // Simulate route planning
    setTimeout(() => {
      // Calculate total distance (simulated)
      const totalDistance =
        Math.floor(Math.random() * 200) + 100; // 100-300 miles
      const estimatedDuration = Math.floor(
        (totalDistance / 60) * 60,
      ); // Assuming 60 mph average

      // Filter stations based on user preferences
      let filteredStations = stations;

      // Filter by connector type
      if (connectorType !== "any") {
        filteredStations = filteredStations.filter((station) =>
          station.chargerTypes.includes(connectorType as any),
        );
      }

      // Filter by cuisine preference
      if (cuisinePreference !== "any") {
        filteredStations = filteredStations.filter((station) =>
          station.restaurants.some((restaurant) => {
            const cuisineLower =
              restaurant.cuisine[0].toLowerCase(); // Fix if there more than 1 cuisine n the list
            const prefLower = cuisinePreference.toLowerCase();
            // Cuisines filters shall be changed
            if (prefLower === "american")
              return cuisineLower.includes("american");
            if (prefLower === "asian")
              return cuisineLower.includes("asian");
            // ||
            // cuisineLower.includes("chinese") ||
            // cuisineLower.includes("thai")
            if (prefLower === "vegetarian")
              return cuisineLower.includes("vegetarian");
            // ||
            // cuisineLower.includes("organic")
            if (prefLower === "italian")
              return cuisineLower.includes("italian");
            if (prefLower === "japanese")
              return (
                cuisineLower.includes("japanese") ||
                cuisineLower.includes("sushi")
              );
            if (prefLower === "coffee")
              return (
                cuisineLower.includes("coffee") ||
                cuisineLower.includes("cafe")
              );
            if (prefLower === "international")
              return cuisineLower.includes("international");

            return false;
          }),
        );
      }

      // Select 1 charging station along the route
      // const numberOfStops = totalDistance > 200 ? 3 : 2;
      const selectedStations = filteredStations;
      // const selectedStations =
      // filteredStations.length >= numberOfStops
      //   ? filteredStations
      //       .sort(() => 0.5 - Math.random())
      //       .slice(0, numberOfStops)
      //   : filteredStations;

      const stops: JourneyStop[] = selectedStations.map(
        (station, index) => {
          // const distanceFromStart = Math.floor(
          //   (totalDistance / (numberOfStops + 1)) * (index + 1),
          // );
          const distanceFromStart = 30; // Random number
          const timeFromStart = Math.floor(
            (distanceFromStart / 60) * 60,
          ); // minutes

          // Calculate charging duration based on desired SOC
          // Higher desired SOC = longer charging time
          const baseChargingTime = 20;
          const socMultiplier = desiredSOC[0] / 80; // Normalized to 80% baseline
          const calculatedDuration = Math.floor(
            baseChargingTime * socMultiplier +
              Math.random() * 15,
          );

          return {
            station,
            estimatedArrivalTime: new Date(
              Date.now() + timeFromStart * 60000,
            ),
            chargingDuration: Math.min(calculatedDuration, 60), // Cap at 60 minutes
            distanceFromStart,
            isSelected: false, // User needs to select this stop
          };
        },
      );

      const journey: PlannedJourney = {
        id: Date.now().toString(),
        startLocation: currentLocation,
        endLocation,
        totalDistance,
        estimatedDuration,
        stops,
        createdAt: new Date(),
      };

      onPlanJourney(journey);
      onViewRoute(journey);
      setIsPlanning(false);
    }, 1500);
  };

  return (
    <div className="min-h-[calc(100vh-120px)] bg-gray-50">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <Route className="w-6 h-6 text-green-600" />
          <h2>Plan Your Journey</h2>
        </div>
        <p className="text-gray-600">
          Plan your trip with charging stops and pre-order meals
          along the way
        </p>

        {/* Active Filters Summary */}
        {(true || // quick fix to show filter summary always
          connectorType !== "any" ||
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
                {cuisinePreference.charAt(0).toUpperCase() +
                  cuisinePreference.slice(1)}
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
              <span>Journey Preferences</span>
              {/* {(connectorType !== "any" ||
                cuisinePreference !== "any") && (
                <Badge
                  variant="outline"
                  className="bg-green-50"
                >
                  Active
                </Badge>
              )} */}
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
                <div className="flex items-center gap-2 text-sm">
                  <Battery className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600">
                    Battery & Range
                  </span>
                </div>

                {/* Current SOC */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm">
                      Current Battery Level
                    </Label>
                    <span className="text-sm text-green-600">
                      {currentSOC[0]}%
                    </span>
                  </div>
                  <Slider
                    value={currentSOC}
                    onValueChange={setCurrentSOC}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Current Range */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm">
                      Current Range
                    </Label>
                    <span className="text-sm text-green-600">
                      {currentRange[0]} km
                    </span>
                  </div>
                  <Slider
                    value={currentRange}
                    onValueChange={setCurrentRange}
                    min={0}
                    max={400}
                    step={10}
                    className="w-full"
                  />
                </div>

                {/* Desired SOC */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm">
                      Desired Charge Level at Stops
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

              {/* Charging Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600">
                    Charging
                  </span>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">
                    Connector Type
                  </Label>
                  <Select
                    value={connectorType}
                    onValueChange={setConnectorType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select connector type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">
                        Any Connector
                      </SelectItem>
                      <SelectItem value="Type 2">
                        Type 2
                      </SelectItem>
                      <SelectItem value="CCS">CCS</SelectItem>
                      <SelectItem value="ChaDeMo">
                        ChaDeMo
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Cuisine Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <UtensilsCrossed className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600">
                    Food Preferences
                  </span>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">
                    Cuisine Preference
                  </Label>
                  <Select
                    value={cuisinePreference}
                    onValueChange={setCuisinePreference}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cuisine" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">
                        Any Cuisine
                      </SelectItem>
                      <SelectItem value="american">
                        American
                      </SelectItem>
                      <SelectItem value="asian">
                        Asian
                      </SelectItem>
                      <SelectItem value="healthy">
                        Vegetarian
                      </SelectItem>
                      <SelectItem value="italian">
                        Italian
                      </SelectItem>
                      <SelectItem value="japanese">
                        Japanese
                      </SelectItem>
                      <SelectItem value="coffee">
                        Coffee & Pastries
                      </SelectItem>
                      <SelectItem value="international">
                        International
                      </SelectItem>
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
          {/* Current Location (Display Only) */}
          <div className="space-y-2">
            <Label>Your Current Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-600" />
              <div className="pl-9 pr-4 py-2 bg-green-50 border border-green-200 rounded-md text-sm">
                {currentLocation}
              </div>
            </div>
          </div>

          {/* <div className="flex justify-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-green-600" />
            </div>
          </div> */}

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
      </div>
    </div>
  );
}