import { MenuItem, StationWithMenusModel } from "@types";
import z from "zod";

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
  station_id: number; // not needed for charging session
  stationName: string;
  items: { menuItem: MenuItem; quantity: number }[];
  totalCost: number;
  status: "pending" | "cooking" | "ready" | "completed";
  pickupTime?: Date;
};

export const chargingStatusEnum = z.enum(["not_started", "active", "finished"]);
export type ChargingStatus = z.infer<typeof chargingStatusEnum>;
