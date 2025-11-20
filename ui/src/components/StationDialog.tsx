import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Navigation, 
  Zap, 
  Star, 
  MapPin, 
  DollarSign, 
  UtensilsCrossed, 
  Wifi, 
  Coffee, 
  ShoppingCart,
  Info,
  Clock,
  Phone,
  X
} from "lucide-react";

type ChargingStation = {
  id: string;
  name: string;
  address: string;
  distance: number;
  availableChargers: number;
  totalChargers: number;
  chargerTypes: string[];
  pricePerKwh: number;
  rating?: number;
  lat: number;
  lng: number;
  restaurants?: Array<{ id: string; name: string; cuisine: string[] }>;
  amenities?: string[];
};

type StationDialogProps = {
  station: ChargingStation | null;
  open: boolean;
  onClose: () => void;
  onNavigate: (station: ChargingStation) => void;
  onStartCharging: (station: ChargingStation) => void;
};

export function StationDialog({ station, open, onClose, onNavigate, onStartCharging }: StationDialogProps) {
  if (!station) return null;

  const estimatedCost = (50 * station.pricePerKwh).toFixed(2);
  const amenityIcons: Record<string, any> = {
    'WiFi': Wifi,
    'Cafe': Coffee,
    'Restaurant': UtensilsCrossed,
    'Shop': ShoppingCart,
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-start z-10">
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-1">{station.name}</h2>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{station.address}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 -mr-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-3 text-center">
              <div className="text-gray-600 text-sm mb-1">Distance</div>
              <div className="font-semibold">{station.distance.toFixed(1)} km</div>
            </Card>
            <Card className="p-3 text-center">
              <div className="text-gray-600 text-sm mb-1">Rating</div>
              <div className="flex items-center justify-center gap-1 font-semibold">
                {station.rating ? (
                  <>
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    {station.rating.toFixed(1)}
                  </>
                ) : (
                  <span className="text-gray-400">N/A</span>
                )}
              </div>
            </Card>
            <Card className="p-3 text-center">
              <div className="text-gray-600 text-sm mb-1">Price</div>
              <div className="font-semibold">€{station.pricePerKwh.toFixed(2)}/kWh</div>
            </Card>
          </div>

          {/* Availability */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Charger Availability</h3>
              <Badge
                variant={station.availableChargers > 0 ? "default" : "secondary"}
                className={station.availableChargers > 0 ? "bg-green-600" : "bg-gray-400"}
              >
                {station.availableChargers > 0 ? "Available" : "Full"}
              </Badge>
            </div>

            <div className="space-y-2">
              {station.chargerTypes.map((type) => {
                const available = Math.floor(station.availableChargers / station.chargerTypes.length);
                const total = Math.floor(station.totalChargers / station.chargerTypes.length);

                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-green-600" />
                      <span className="text-sm">{type}</span>
                    </div>
                    <span className="text-sm">{available}/{total} available</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Restaurants */}
          {station.restaurants && station.restaurants.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <UtensilsCrossed className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold">Nearby Restaurants</h3>
                <Badge variant="secondary">{station.restaurants.length}</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Pre-order food to be ready when you arrive
              </p>
              <div className="space-y-2">
                {station.restaurants.slice(0, 3).map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className="p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="font-medium mb-1">{restaurant.name}</div>
                    <div className="text-sm text-gray-600">
                      {restaurant.cuisine.join(', ')}
                    </div>
                  </div>
                ))}
                {station.restaurants.length > 3 && (
                  <p className="text-xs text-gray-500 text-center">
                    +{station.restaurants.length - 3} more restaurants
                  </p>
                )}
              </div>
            </Card>
          )}

          {/* Amenities */}
          {station.amenities && station.amenities.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {station.amenities.map((amenity) => {
                  const Icon = amenityIcons[amenity];
                  return (
                    <Badge key={amenity} variant="outline" className="flex items-center gap-1">
                      {Icon && <Icon className="w-3 h-3" />}
                      {amenity}
                    </Badge>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Network Info */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Station Information</h3>
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
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm">
                  Estimated cost for 50 kWh charge:{" "}
                  <span className="font-semibold">€{estimatedCost}</span>
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Actual cost may vary based on charging speed and session time
                </p>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                onNavigate(station);
                onClose();
              }}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Navigate
            </Button>
          </div>

          <Button
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
            disabled={station.availableChargers === 0}
            onClick={() => {
              onStartCharging(station);
              onClose();
            }}
          >
            <Zap className="w-5 h-5 mr-2" />
            {station.availableChargers === 0 ? "No Chargers Available" : "Start Charging"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
