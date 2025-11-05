// VIEW NOT USED

import { useState } from "react";
import { ChargingStation } from "../App";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Star,
  MapPin,
  Zap,
  Search,
  Navigation2,
  SlidersHorizontal,
  UtensilsCrossed,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type StationListProps = {
  stations: ChargingStation[];
  onSelectStation: (station: ChargingStation) => void;
  // favorites: string[];
  // onToggleFavorite: (stationId: string) => void;
};

export function StationList({
  stations,
  onSelectStation,
  // favorites,
  // onToggleFavorite,
}: StationListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("distance");

  const filteredStations = stations
    .filter((station) => {
      const matchesSearch =
        station.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        station.address
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesFilter =
        filterType === "all" ||
        (filterType === "available" &&
          station.availableChargers > 0);
      // ||
      // (filterType === 'favorites' && favorites.includes(station.id));

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === "distance") return a.distance - b.distance;
      // if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === "price")
        return a.pricePerKwh - b.pricePerKwh;
      return 0;
    });

  return (
    <div className="min-h-[calc(100vh-120px)] bg-gray-50">
      <div className="p-4 space-y-4">
        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search stations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex gap-2">
            <Select
              value={filterType}
              onValueChange={setFilterType}
            >
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  All Stations
                </SelectItem>
                <SelectItem value="available">
                  Available Only
                </SelectItem>
                {/* <SelectItem value="favorites">Favorites</SelectItem> */}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="distance">
                  Nearest
                </SelectItem>
                <SelectItem value="rating">
                  Top Rated
                </SelectItem>
                <SelectItem value="price">
                  Lowest Price
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {filteredStations.length} stations found
          </p>
        </div>

        {/* Station Cards */}
        <div className="space-y-3 pb-4">
          {filteredStations.map((station) => (
            <Card
              key={station.id}
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onSelectStation(station)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-start gap-2 mb-1">
                    <h3 className="flex-1">{station.name}</h3>
                    {/* <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(station.id);
                      }}
                      className="text-gray-400 hover:text-yellow-500 transition-colors"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          favorites.includes(station.id)
                            ? 'fill-yellow-500 text-yellow-500'
                            : ''
                        }`}
                      />
                    </button> */}
                  </div>

                  <div className="flex items-center gap-1 text-gray-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">
                      {station.address}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">
                      {station.distance} mi
                    </span>
                    <span className="text-gray-400">•</span>
                    {/* <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      {station.rating}
                    </span> */}
                    <span className="text-gray-400">•</span>
                    <span>${station.pricePerKwh}/kWh</span>
                  </div>
                </div>
              </div>

              {station.restaurants.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <UtensilsCrossed className="w-4 h-4 text-green-600" />
                  <span>
                    {station.restaurants.length} restaurant
                    {station.restaurants.length > 1
                      ? "s"
                      : ""}{" "}
                    nearby
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {station.chargerTypes.map((type) => (
                    <Badge
                      key={type}
                      variant="secondary"
                      className="text-xs"
                    >
                      {type}
                    </Badge>
                  ))}
                </div>

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
                  <Zap className="w-3 h-3 mr-1" />
                  {station.availableChargers}/
                  {station.totalChargers}
                </Badge>
              </div>

              <div className="mt-3 pt-3 border-t flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Navigation2 className="w-4 h-4 mr-1" />
                  Navigate
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={station.availableChargers === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectStation(station);
                  }}
                >
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}