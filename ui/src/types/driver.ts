import { MenuItem, StationWithMenusModel } from "@types";

export type RestaurantWithMenu = {
  restaurant_id: number;
  name: string;
  cuisines: string[];
  menu: MenuItem[];
};

export type JourneyStop = {
  station: StationWithMenusModel;
  estimatedArrivalTime: Date;
  socAtArrival: number;
  chargingDuration: number;
  distanceFromStart: number;
  selectedRestaurantId?: number;
  isSelected: boolean;
};

export type PlannedJourney = {
  id: string;
  startLocation: string;
  endLocation: string;
  stops: JourneyStop[];
  createdAt: Date;
};

export type ChargingSessionType = {
  id: string;
  station_id: number;
  stationName: string;
  startTime: Date;
  endTime?: Date;
  energyDelivered: number;
  cost: number;
  status: "active" | "completed";
};

export type RestaurantOrder = {
  id: string;
  restaurant_id: number;
  restaurantName: string;
  station_id: number;
  stationName: string;
  items: { menuItem: MenuItem; quantity: number }[];
  totalCost: number;
  status: "pending" | "cooking" | "ready" | "completed";
  orderTime: Date;
  pickupTime?: Date;
};
