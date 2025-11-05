// VIEW NOT USED

import { useState } from "react";
import { ChargingStation } from "../App";
import { MapPin, Navigation, Star, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, Filter } from "lucide-react";

type MapViewProps = {
  stations: ChargingStation[];
  selectedStation: ChargingStation | null;
  onSelectStation: (station: ChargingStation) => void;
  favorites: string[];
};

export function MapView({
  stations,
  selectedStation,
  onSelectStation,
  favorites,
}: MapViewProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="relative h-[calc(100vh-120px)]">
      {/* Search Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search for charging stations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white shadow-lg"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          className="bg-white shadow-lg"
        >
          <Filter className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="bg-white shadow-lg"
        >
          <Navigation className="w-4 h-4" />
        </Button>
      </div>

      {/* Mock Map Background */}
      <div className="w-full h-full bg-gradient-to-br from-blue-100 via-green-50 to-gray-100 relative overflow-hidden">
        {/* Map Grid Pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Road Lines */}
        <div className="absolute top-1/3 left-0 right-0 h-1 bg-gray-300" />
        <div className="absolute top-2/3 left-0 right-0 h-1 bg-gray-300" />
        <div className="absolute left-1/3 top-0 bottom-0 w-1 bg-gray-300" />
        <div className="absolute left-2/3 top-0 bottom-0 w-1 bg-gray-300" />

        {/* Station Markers */}
        {stations.map((station, index) => {
          const positions = [
            { top: "35%", left: "45%" },
            { top: "50%", left: "65%" },
            { top: "60%", left: "30%" },
            { top: "40%", left: "70%" },
            { top: "25%", left: "55%" },
          ];
          const pos = positions[index % positions.length];

          return (
            <button
              key={station.id}
              onClick={() => onSelectStation(station)}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110 ${
                selectedStation?.id === station.id
                  ? "scale-125 z-20"
                  : "z-10"
              }`}
              style={{ top: pos.top, left: pos.left }}
            >
              <div className="relative">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                    station.availableChargers > 0
                      ? "bg-green-600"
                      : "bg-gray-400"
                  }`}
                >
                  <Zap className="w-6 h-6 text-white fill-white" />
                </div>
                {favorites.includes(station.id) && (
                  <Star className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500 fill-yellow-500" />
                )}
                {station.availableChargers > 0 && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs">
                    {station.availableChargers}
                  </div>
                )}
              </div>
            </button>
          );
        })}

        {/* Current Location */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg" />
            <div className="absolute inset-0 w-4 h-4 bg-blue-400 rounded-full animate-ping opacity-75" />
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-sm">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 bg-green-600 rounded-full" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-400 rounded-full" />
          <span>Occupied</span>
        </div>
      </div>
    </div>
  );
}