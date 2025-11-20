import { useState } from "react";
import { PlannedJourney, JourneyStop, RestaurantOrder } from "@/pages/home";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { RestaurantMenu } from "./RestaurantMenu";
import { MapPin, Zap, Clock, UtensilsCrossed, Flag } from "lucide-react";
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
  const [selectedRestaurant, setSelectedRestaurant] = useState<{
    stop: JourneyStop;
    restaurant: JourneyStop["station"]["restaurants"][0];
  } | null>(null);

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
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
          ← Back to Planner
        </Button>
        <h2 className="mb-2">Your Journey Plan</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <span>
            {journey.stops.length} charging station suggestion
            {journey.stops.length > 1 ? "s" : ""}
          </span>
        </div>
        <p className="text-sm text-gray-600">
          Review the suggested charging stations below and pre-order a meal to
          start your journey
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Route Overview */}
          <Card className="p-4">
            <div className="space-y-4">
              {/* Start */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-600">Starting Point</div>
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
                        stop.isSelected || stop.selectedRestaurantId
                          ? "bg-green-600 border-green-600"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      <Zap
                        className={`w-5 h-5 ${
                          stop.isSelected || stop.selectedRestaurantId
                            ? "text-white"
                            : "text-gray-400"
                        }`}
                      />
                    </div>

                    <Card
                      className={`p-3 transition-all ${
                        stop.isSelected || stop.selectedRestaurantId
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

                            <Badge variant="outline" className="text-xs">
                              {stop.distanceFromStart} km
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <Card className="p-4">
                        <h3 className="mb-3">Charger Details</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Available chargers
                            </span>
                            <Badge
                              className={
                                stop.station.availableChargers > 0
                                  ? "bg-green-600"
                                  : "bg-gray-400"
                              }
                            >
                              {stop.station.availableChargers}/
                              {stop.station.totalChargers}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Price</span>
                            <span>${stop.station.pricePerKwh}/kWh</span>
                          </div>
                        </div>
                      </Card>

                      <div className="flex items-center gap-4 text-sm mb-2">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-600" />
                          <span className="text-gray-600">
                            Arrive {formatTime(stop.estimatedArrivalTime)}
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
                              {stop.station.restaurants.map((restaurant) => (
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
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {stop.selectedRestaurantId && (
                        <Badge className="mt-2 bg-orange-600">
                          Food pre-ordered
                        </Badge>
                      )}
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
                  <div className="text-sm text-gray-600">Destination</div>
                  <div>{journey.endLocation}</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </ScrollArea>

      {/* Restaurant Menu Modal */}
      {selectedRestaurant && (
        <RestaurantMenu
          restaurant={selectedRestaurant.restaurant}
          stationId={selectedRestaurant.stop.station.id}
          stationName={selectedRestaurant.stop.station.name}
          onClose={() => setSelectedRestaurant(null)}
          onPlaceOrder={(order) => {
            onPlaceOrder(order);
            const stopIndex = journey.stops.findIndex(
              (s) => s.station.id === selectedRestaurant.stop.station.id
            );
            if (stopIndex !== -1) {
              journey.stops.forEach((stop, index) => {
                if (index !== stopIndex) {
                  stop.isSelected = false;
                }
              });
              journey.stops[stopIndex].selectedRestaurantId =
                selectedRestaurant.restaurant.id;
              journey.stops[stopIndex].isSelected = true;
            }
            setSelectedRestaurant(null);
            setTimeout(() => {
              onStartJourney();
            }, 500);
          }}
        />
      )}
    </div>
  );
}
