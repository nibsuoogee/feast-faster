import { useState } from "react";
import { PlannedJourney, JourneyStop } from "./JourneyPlanner";
import { RestaurantOrder } from "../App";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { RestaurantMenu } from "./RestaurantMenu";
import {
  MapPin,
  Navigation,
  Zap,
  Clock,
  UtensilsCrossed,
  Star,
  ChevronRight,
  Flag,
  Play,
  ArrowRight,
} from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

type RoutePreviewProps = {
  journey: PlannedJourney;
  onStartJourney: () => void;
  onPlaceOrder: (order: RestaurantOrder) => void;
  onBack: () => void;
};

export function RoutePreview({
  journey,
  onStartJourney,
  onPlaceOrder,
  onBack,
}: RoutePreviewProps) {
  const [selectedStop, setSelectedStop] =
    useState<JourneyStop | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<{
    stop: JourneyStop;
    restaurant: JourneyStop["station"]["restaurants"][0];
  } | null>(null);

  const [, setRefresh] = useState(0);

  // const toggleStopSelection = (stopIndex: number) => {
  //   // Deselect all stops first (single selection only)
  //   journey.stops.forEach((stop, index) => {
  //     if (index !== stopIndex) {
  //       stop.isSelected = false;
  //     }
  //   });
  //   // Toggle the selected stop
  //   journey.stops[stopIndex].isSelected = !journey.stops[stopIndex].isSelected;
  //   // Force re-render
  //   setRefresh(prev => prev + 1);
  // };

  // const selectedStopsCount = journey.stops.filter(s => s.isSelected || s.selectedRestaurantId).length;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="min-h-[calc(100vh-120px)] bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-2"
        >
          ← Back to Planner
        </Button>
        <h2 className="mb-2">Your Journey Plan</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          {/* <span>{journey.totalDistance} mi</span>
          <span>•</span>
          <span>{formatDuration(journey.estimatedDuration)}</span>
          <span>•</span> */}
          <span>
            {journey.stops.length} suggested stop
            {journey.stops.length > 1 ? "s" : ""}
          </span>
        </div>
        <p className="text-sm text-orange-600">
          Select a restaurant and pre-order a meal to start your
          journey
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Selection Summary */}
          {/* <Card className="p-4 bg-orange-50 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">
                  {selectedStopsCount === 0
                    ? "No stop selected yet"
                    : `1 charging stop selected`}
                </div>
                <p className="text-sm">
                  {selectedStopsCount === 0
                    ? "Select one charging stop to continue"
                    : "You can change your stop or pre-order food"}
                </p>
              </div>
              <div className="text-3xl">
                {selectedStopsCount > 0 ? "✓" : "—"}
              </div>
            </div>
          </Card> */}

          {/* Route Overview */}
          <Card className="p-4">
            <div className="space-y-4">
              {/* Start */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-600">
                    Starting Point
                  </div>
                  <div>{journey.startLocation}</div>
                </div>
                <Badge variant="outline">Now</Badge>
              </div>

              <div className="ml-5 border-l-2 border-dashed border-gray-300 pl-8 space-y-4">
                {/* Charging Stops */}
                {journey.stops.map((stop, index) => (
                  <div key={index} className="relative">
                    <div
                      className={`absolute -left-[54px] w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        stop.isSelected ||
                        stop.selectedRestaurantId
                          ? "bg-green-600 border-green-600"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      <Zap
                        className={`w-5 h-5 ${
                          stop.isSelected ||
                          stop.selectedRestaurantId
                            ? "text-white"
                            : "text-gray-400"
                        }`}
                      />
                    </div>

                    <Card
                      className={`p-3 transition-all ${
                        stop.isSelected ||
                        stop.selectedRestaurantId
                          ? "border-2 border-green-600 bg-green-50"
                          : "hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p>
                              {/* Stop {index + 1}:{" "} */}
                              <p>{stop.station.name}</p>
                              <span className="text-sm text-gray-600">
                                {stop.station.address}
                              </span>
                            </p>

                            <Badge
                              variant="outline"
                              className="text-xs"
                            >
                              {stop.distanceFromStart} km
                            </Badge>
                            {/* {(stop.isSelected ||
                              stop.selectedRestaurantId) && (
                              <Badge className="bg-green-600 text-xs">
                                Selected
                              </Badge>
                            )} */}
                          </div>
                        </div>
                      </div>

                      <Card className="p-4">
                        <h3 className="mb-3">
                          Charger Details
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Available chargers
                            </span>
                            <Badge
                              className={
                                stop.station.availableChargers >
                                0
                                  ? "bg-green-600"
                                  : "bg-gray-400"
                              }
                            >
                              {stop.station.availableChargers}/
                              {stop.station.totalChargers}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Price
                            </span>
                            <span>
                              ${stop.station.pricePerKwh}/kWh
                            </span>
                          </div>
                          {/* <div className="flex justify-between">
                            <span className="text-gray-600">
                              Network
                            </span>
                            <Badge variant="outline">
                              {selectedStop.station.network}
                            </Badge>
                          </div> */}
                        </div>
                      </Card>

                      <div className="flex items-center gap-4 text-sm mb-2">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-600" />
                          <span className="text-gray-600">
                            Arrive{" "}
                            {formatTime(
                              stop.estimatedArrivalTime,
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-gray-600" />
                          <span className="text-gray-600">
                            {stop.chargingDuration} min charge
                          </span>
                        </div>
                      </div>

                      {stop.station.restaurants.length > 0 && (
                        <>
                          <Separator className="my-2" />
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <UtensilsCrossed className="w-4 h-4 text-green-600" />
                              <span className="text-gray-600">
                                Pre-order food:
                              </span>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                              {stop.station.restaurants.map(
                                (restaurant) => (
                                  <button
                                    key={restaurant.id}
                                    onClick={() => {
                                      setSelectedRestaurant({
                                        stop,
                                        restaurant,
                                      });
                                    }}
                                    className="flex-shrink-0 w-32 bg-gray-50 hover:bg-gray-100 rounded-lg p-2 transition-colors"
                                  >
                                    <img
                                      src={restaurant.image}
                                      alt={restaurant.name}
                                      className="w-full h-20 object-cover rounded-md mb-2"
                                    />
                                    <div className="text-xs truncate">
                                      {restaurant.name}
                                    </div>
                                    <div className="text-xs text-gray-500 truncate">
                                      {restaurant.cuisine}
                                    </div>
                                  </button>
                                ),
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      {stop.selectedRestaurantId && (
                        <Badge className="mt-2 bg-orange-600">
                          Food pre-ordered
                        </Badge>
                      )}
                      {/* 
                      <div className="mt-3 pt-3 border-t flex gap-2">
                        {stop.isSelected ||
                        stop.selectedRestaurantId ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() =>
                              toggleStopSelection(index)
                            }
                          >
                            Remove Stop
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() =>
                              toggleStopSelection(index)
                            }
                          >
                            Select This Stop
                          </Button>
                        )}
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => setSelectedStop(stop)}
                        >
                          View Details
                        </Button>
                      </div> */}
                    </Card>
                  </div>
                ))}
              </div>

              {/* Destination */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Flag className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-600">
                    Destination
                  </div>
                  <div>{journey.endLocation}</div>
                </div>
                {/* <Badge variant="outline">
                  {formatTime(
                    new Date(
                      Date.now() +
                        journey.estimatedDuration * 60000,
                    ),
                  )}
                </Badge> */}
              </div>
            </div>
          </Card>

          {/* Start Journey Button */}
          {/* <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div>Ready to Start</div>
                <div className="text-sm text-gray-600">
                  {selectedStopsCount === 0
                    ? "Select a stop to begin"
                    : "1 charging stop selected"}
                </div>
              </div>
              <Badge
                variant="outline"
                className="text-lg px-3 py-1"
              >
                {selectedStopsCount > 0 ? "✓" : "—"}
              </Badge>
            </div>

            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
              onClick={onStartJourney}
              disabled={selectedStopsCount === 0}
            >
              <Play className="w-5 h-5 mr-2" />
              Start Journey
            </Button>
          </Card> */}

          {/* {selectedStopsCount === 0 && (
            <p className="text-sm text-center text-orange-600">
              Please select one charging stop to continue
            </p>
          )} */}
          {/* 
          <p className="text-xs text-center text-gray-500">
            Pre-ordering a meal will automatically start your
            journey
          </p> */}
        </div>
      </ScrollArea>

      {/* Stop Detail Modal */}
      {/* {selectedStop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center md:justify-center">
          <div className="bg-white w-full md:max-w-2xl md:rounded-lg max-h-[90vh] overflow-y-auto rounded-t-2xl">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-start">
              <div className="flex-1">
                <h2 className="mb-1">
                  {selectedStop.station.name}
                </h2>
                <p className="text-sm text-gray-600">
                  {selectedStop.station.address}
                </p>
              </div>
              <button
                onClick={() => setSelectedStop(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4"> */}
      {/* Stop Status */}
      {/* {(selectedStop.isSelected ||
                selectedStop.selectedRestaurantId) && (
                <Card className="p-4 bg-green-50 border-green-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div>This stop is selected</div>
                      <div className="text-sm text-gray-600">
                        It will be included in your journey
                      </div>
                    </div>
                  </div>
                </Card>
              )} */}

      {/* Arrival Info */}
      {/* <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600 mb-1">
                      Estimated Arrival
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatTime(
                        selectedStop.estimatedArrivalTime,
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1">
                      Charging Time
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      {selectedStop.chargingDuration} minutes
                    </div>
                  </div>
                </div>
              </Card> */}

      {/* Charger Info */}
      {/* <Card className="p-4">
                <h3 className="mb-3">Charger Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Available Chargers
                    </span>
                    <Badge
                      className={
                        selectedStop.station.availableChargers >
                        0
                          ? "bg-green-600"
                          : "bg-gray-400"
                      }
                    >
                      {selectedStop.station.availableChargers}/
                      {selectedStop.station.totalChargers}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price</span>
                    <span>
                      ${selectedStop.station.pricePerKwh}/kWh
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Network
                    </span>
                    <Badge variant="outline">
                      {selectedStop.station.network}
                    </Badge>
                  </div>
                </div>
              </Card> */}

      {/* Restaurants */}
      {/* {selectedStop.station.restaurants.length > 0 && (
                <Card className="p-4">
                  <h3 className="mb-3">Pre-order Food</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Your meal will be ready when you arrive for
                    charging
                  </p>
                  <div className="space-y-2">
                    {selectedStop.station.restaurants.map(
                      (restaurant) => (
                        <button
                          key={restaurant.id}
                          onClick={() => {
                            setSelectedRestaurant({
                              stop: selectedStop,
                              restaurant,
                            });
                            setSelectedStop(null);
                          }}
                          className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-between"
                        >
                          <div className="text-left flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span>{restaurant.name}</span>
                              <Badge
                                variant="outline"
                                className="text-xs"
                              >
                                {restaurant.priceRange}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-2">
                              <span>{restaurant.cuisine}</span>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                {restaurant.rating}
                              </div>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {restaurant.prepTime}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </button>
                      ),
                    )}
                  </div>
                </Card>
              )} */}

      {/* <Button
                variant="outline"
                className="w-full"
                onClick={() => setSelectedStop(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )*/}

      {/* Restaurant Menu Modal */}
      {selectedRestaurant && (
        <RestaurantMenu
          restaurant={selectedRestaurant.restaurant}
          stationId={selectedRestaurant.stop.station.id}
          stationName={selectedRestaurant.stop.station.name}
          onClose={() => setSelectedRestaurant(null)}
          onPlaceOrder={(order) => {
            onPlaceOrder(order);
            // Update the journey stop to mark restaurant as selected and auto-select the stop
            const stopIndex = journey.stops.findIndex(
              (s) =>
                s.station.id ===
                selectedRestaurant.stop.station.id,
            );
            if (stopIndex !== -1) {
              // Deselect all other stops (single selection)
              journey.stops.forEach((stop, index) => {
                if (index !== stopIndex) {
                  stop.isSelected = false;
                }
              });
              journey.stops[stopIndex].selectedRestaurantId =
                selectedRestaurant.restaurant.id;
              journey.stops[stopIndex].isSelected = true; // Auto-select stop when food is ordered
            }
            setSelectedRestaurant(null);
            // Auto-start journey after pre-ordering
            setTimeout(() => {
              onStartJourney();
            }, 500);
          }}
        />
      )}
    </div>
  );
}