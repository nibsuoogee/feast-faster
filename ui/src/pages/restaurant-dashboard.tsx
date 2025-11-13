import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/restaurant/DashboardHeader';
import { OrderColumn } from '@/components/restaurant/OrderColumn';
import { Restaurant, Order } from '@/types/restaurant';
import { Package } from 'lucide-react';
import { orderService } from '@/services/orders';

export default function RestaurantDashboard() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Load restaurants on mount
  useEffect(() => {
    const loadRestaurants = async () => {
      const data = await orderService.getRestaurants();
      setRestaurants(data);
      setLoading(false);
    };
    loadRestaurants();
  }, []);

  // Load orders when restaurant is selected
  useEffect(() => {
    if (selectedRestaurant) {
      const loadOrders = async () => {
        const data = await orderService.getOrdersByRestaurant(selectedRestaurant.id);
        setOrders(data);
      };
      loadOrders();
      
      // Refresh orders every 30 seconds
      const interval = setInterval(loadOrders, 30000);
      return () => clearInterval(interval);
    } else {
      setOrders([]);
    }
  }, [selectedRestaurant]);

  const filteredOrders = selectedRestaurant
    ? orders.filter((order) => order.restaurantId === selectedRestaurant.id)
    : [];

  const activeOrdersCount = filteredOrders.filter(
    (order) =>
      order.status === 'pending' ||
      order.status === 'cooking' ||
      order.status === 'ready'
  ).length;

  const handleStatusChange = async (orderId: string, newStatus: 'ready' | 'picked_up') => {
    // Optimistic update
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );

    // Call API
    const success = await orderService.updateOrderStatus(orderId, newStatus);
    
    if (!success) {
      // Revert on failure (optional: show error message)
      console.error('Failed to update order status');
      // Reload orders to get correct state
      if (selectedRestaurant) {
        const data = await orderService.getOrdersByRestaurant(selectedRestaurant.id);
        setOrders(data);
      }
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">Loading restaurants...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <DashboardHeader
        restaurants={restaurants}
        selectedRestaurant={selectedRestaurant}
        onSelectRestaurant={setSelectedRestaurant}
        activeOrdersCount={activeOrdersCount}
        userName="Restaurant Manager"
      />

      <main className="flex-1 p-6 overflow-hidden">
        {selectedRestaurant ? (
          <div className="grid grid-cols-4 gap-4 h-full">
            <OrderColumn
              title="Pending"
              status="pending"
              orders={filteredOrders}
              colorClass="bg-gray-600"
            />
            <OrderColumn
              title="Cooking"
              status="cooking"
              orders={filteredOrders}
              onStatusChange={handleStatusChange}
              colorClass="bg-orange-600"
            />
            <OrderColumn
              title="Ready"
              status="ready"
              orders={filteredOrders}
              onStatusChange={handleStatusChange}
              colorClass="bg-green-600"
            />
            <OrderColumn
              title="Picked Up"
              status="picked_up"
              orders={filteredOrders}
              colorClass="bg-purple-600"
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <Package className="h-16 w-16 mx-auto text-gray-400" />
              <div className="text-gray-500">
                Please select a restaurant to view orders
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
