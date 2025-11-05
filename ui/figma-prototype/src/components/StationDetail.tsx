// VIEW NOT USED

import { useState } from "react";
import { ChargingStation, RestaurantOrder } from "../App";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { RestaurantMenu } from "./RestaurantMenu";
import {
  X,
  MapPin,
  Star,
  Navigation2,
  Zap,
  Clock,
  DollarSign,
  Phone,
  Info,
  UtensilsCrossed,
  ChevronRight,
} from "lucide-react";

type StationDetailProps = {
  station: ChargingStation;
  // isFavorite: boolean;
  // onToggleFavorite: () => void;
  onClose: () => void;
  onStartCharging: (station: ChargingStation) => void;
  hasActiveSession: boolean;
  onPlaceOrder: (order: RestaurantOrder) => void;
};

export function StationDetail({
  station,
  // isFavorite,
  // onToggleFavorite,
  onClose,
  onStartCharging,
  hasActiveSession,
  onPlaceOrder,
}: StationDetailProps) {
  const [selectedRestaurant, setSelectedRestaurant] = useState<
    (typeof station.restaurants)[0] | null
  >(null);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center md:justify-center">
      <div className="bg-white w-full md:max-w-2xl md:rounded-lg max-h-[90vh] overflow-y-auto rounded-t-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-start">
          <div className="flex-1">
            <h2 className="mb-1">{station.name}</h2>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{station.address}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-3 text-center">
              <div className="text-gray-600 text-sm mb-1">
                Distance
              </div>
              <div>{station.distance} mi</div>
            </Card>
            <Card className="p-3 text-center">
              <div className="text-gray-600 text-sm mb-1">
                Rating
              </div>
              <div className="flex items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                {station.rating}
              </div>
            </Card>
            <Card className="p-3 text-center">
              <div className="text-gray-600 text-sm mb-1">
                Price
              </div>
              <div>${station.pricePerKwh}/kWh</div>
            </Card>
          </div>

          {/* Availability */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3>Charger Availability</h3>
              <Badge
                variant={
                  station.availableChargers > 0
                    ? "default"
                    : "secondary"
                }
                className={
                  station.availableChargers > 0
                    ? "bg-green-600"
                    : "bg-gray-400"
                }
              >
                {station.availableChargers > 0
                  ? "Available"
                  : "Full"}
              </Badge>
            </div>

            <div className="space-y-2">
              {station.chargerTypes.map((type) => {
                const available = Math.floor(
                  station.availableChargers /
                    station.chargerTypes.length,
                );
                const total = Math.floor(
                  station.totalChargers /
                    station.chargerTypes.length,
                );

                return (
                  <div
                    key={type}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-green-600" />
                      <span className="text-sm">{type}</span>
                    </div>
                    <span className="text-sm">
                      {available}/{total} available
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Restaurants */}
          {station.restaurants.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <UtensilsCrossed className="w-5 h-5 text-green-600" />
                <h3>Nearby Restaurants</h3>
                <Badge variant="secondary">
                  {station.restaurants.length}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Pre-order food to be ready when you arrive
              </p>
              <div className="space-y-2">
                {station.restaurants.map((restaurant) => (
                  <button
                    key={restaurant.id}
                    onClick={() =>
                      setSelectedRestaurant(restaurant)
                    }
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
                ))}
              </div>
            </Card>
          )}

          {/* Amenities */}
          {station.amenities.length > 0 && (
            <Card className="p-4">
              <h3 className="mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {station.amenities.map((amenity) => (
                  <Badge key={amenity} variant="outline">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Network Info */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3>Network</h3>
              <Badge>{station.network}</Badge>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Open 24/7</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>Support: 1-800-CHARGE</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span>Payment: Credit Card, Mobile App</span>
              </div>
            </div>
          </Card>

          {/* Pricing Details */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm">
                  Estimated cost for 50 kWh charge:{" "}
                  <span>
                    ${(station.pricePerKwh * 50).toFixed(2)}
                  </span>
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Actual cost may vary based on charging speed
                  and session time
                </p>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            {/* <Button
              variant="outline"
              className="flex-1"
              onClick={onToggleFavorite}
            >
              <Star
                className={`w-4 h-4 mr-2 ${
                  isFavorite
                    ? "fill-yellow-500 text-yellow-500"
                    : ""
                }`}
              />
              {isFavorite ? "Saved" : "Save"}
            </Button> */}
            <Button variant="outline" className="flex-1">
              <Navigation2 className="w-4 h-4 mr-2" />
              Navigate
            </Button>
          </div>

          <Button
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
            disabled={
              station.availableChargers === 0 ||
              hasActiveSession
            }
            onClick={() => {
              onStartCharging(station);
              onClose();
            }}
          >
            <Zap className="w-5 h-5 mr-2" />
            {hasActiveSession
              ? "Charging in Progress"
              : station.availableChargers === 0
                ? "No Chargers Available"
                : "Start Charging"}
          </Button>
        </div>
      </div>

      {/* Restaurant Menu Modal */}
      {selectedRestaurant && (
        <RestaurantMenu
          restaurant={selectedRestaurant}
          stationId={station.id}
          stationName={station.name}
          onClose={() => setSelectedRestaurant(null)}
          onPlaceOrder={onPlaceOrder}
        />
      )}
    </div>
  );
}