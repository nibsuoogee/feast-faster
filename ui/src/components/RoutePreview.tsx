import { useState } from "react";
import { PlannedJourney, JourneyStop, RestaurantOrder } from "@/types/driver";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { RestaurantMenu } from "./RestaurantMenu";
import { MapPin, Zap, Clock, UtensilsCrossed, Flag } from "lucide-react";

const restaurantImages = [
  "https://images.unsplash.com/photo-1555057949-7e4a30956f1f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  "https://images.unsplash.com/photo-1628565350863-533a3c174b85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  "https://images.unsplash.com/photo-1644447381290-85358ae625cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  "https://images.unsplash.com/photo-1563245738-9169ff58eccf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  "https://images.unsplash.com/photo-1600470944938-b301e41001c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  "https://images.unsplash.com/photo-1559314809-0d155014e29e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  "https://images.unsplash.com/photo-1710533820700-dd6f6623cc97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
];

const randomFromArray = (arr: string[]) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

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
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours} h ${mins} min`;
    }
    return `${mins} min`;
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

      <div className="p-4 space-y-4 w-full max-w-full">
        {/* Route Overview */}
        <div className="space-y-4 w-full max-w-full overflow-hidden">
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

          {/* Charging Stops */}
          <div className="space-y-4">
            {journey.stops.map((stop, index) => (
              <div key={index} className="relative">
                <Card className="bg-white hover:shadow-md p-4 w-full max-w-full box-border overflow-x-hidden">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{stop.station.name}</p>
                      <span className="text-sm text-gray-600">
                        {stop.station.address}
                      </span>
                    </div>

                    <Badge variant="outline" className="text-xs">
                      {stop.distanceFromStart} km
                    </Badge>
                  </div>

                  <Card className="p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Available chargers</span>
                      <Badge
                        className={
                          stop.station.chargers.length > 0
                            ? "bg-green-600"
                            : "bg-gray-400"
                        }
                      >
                        {stop.station.chargers.length}
                      </Badge>
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
                        {formatDuration(stop.chargingDuration)} charge
                      </span>
                    </div>
                  </div>

                  {stop.station.restaurants.length > 0 && (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <UtensilsCrossed className="w-4 h-4 text-green-600" />
                          <span className="text-gray-600">Pre-order food:</span>
                        </div>
                        {/* Scrollable row */}
                        <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-2">
                          {stop.station.restaurants.map((restaurant) => (
                            <button
                              key={restaurant.restaurant_id}
                              onClick={() => {
                                setSelectedRestaurant({
                                  stop,
                                  restaurant,
                                });
                              }}
                              className="flex-shrink-0 w-32 bg-gray-50 hover:bg-gray-100 rounded-lg p-2 transition-colors"
                            >
                              <img
                                src={randomFromArray(restaurantImages)}
                                alt={restaurant.name}
                                className="w-full h-20 object-cover rounded-md mb-2"
                              />
                              <div className="text-xs truncate">
                                {restaurant.name}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {restaurant.cuisines
                                  .map((c) => c[0].toUpperCase() + c.slice(1))
                                  .join(", ")}
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
      </div>

      {/* Restaurant Menu Modal */}
      {selectedRestaurant && (
        <RestaurantMenu
          restaurant={selectedRestaurant.restaurant}
          stationId={selectedRestaurant.stop.station.station_id}
          stationName={selectedRestaurant.stop.station.name}
          customerEta={selectedRestaurant.stop.estimatedArrivalTime}
          chargingDuration={selectedRestaurant.stop.chargingDuration}
          onClose={() => setSelectedRestaurant(null)}
          onPlaceOrder={(order) => {
            onPlaceOrder(order);
            const stopIndex = journey.stops.findIndex(
              (s) =>
                s.station.station_id ===
                selectedRestaurant.stop.station.station_id
            );
            if (stopIndex !== -1) {
              journey.stops.forEach((stop, index) => {
                if (index !== stopIndex) {
                  stop.isSelected = false;
                }
              });
              journey.stops[stopIndex].selectedRestaurantId =
                selectedRestaurant.restaurant.restaurant_id;
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
