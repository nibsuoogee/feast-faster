import { FoodStatus } from "@types";

export interface OrderItem {
  name: string;
  quantity: number;
  preparationTime: number; // in minutes
}

export interface Order {
  id: string;
  orderNumber: string;
  restaurant_id: string;
  status: FoodStatus;
  customerETA: Date; // when customer will arrive
  items: OrderItem[];
  chargePercentage?: number; // battery charge percentage for delivery driver
  start_cooking_order: Date;
}

export interface Restaurant {
  id: string;
  name: string;
}
