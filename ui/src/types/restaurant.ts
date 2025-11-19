export interface OrderItem {
  name: string;
  quantity: number;
  preparationTime: number; // in minutes
}

export type OrderStatus = 'pending' | 'cooking' | 'ready' | 'picked_up';

export interface Order {
  id: string;
  orderNumber: string;
  restaurantId: string;
  status: OrderStatus;
  customerETA: Date; // when customer will arrive
  items: OrderItem[];
  chargePercentage?: number; // battery charge percentage for delivery driver
}

export interface Restaurant {
  id: string;
  name: string;
}
