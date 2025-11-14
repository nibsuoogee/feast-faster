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
      let intervalId: NodeJS.Timeout | null = null;
      
      const loadOrders = async () => {
        const { orders: data, usingMockData } = await orderService.getOrdersByRestaurant(selectedRestaurant.id);
        setOrders(data);
        
        // Only set up refresh interval if using real API (not mock data)
        // This prevents mock data from resetting user changes every 30 seconds
        if (!usingMockData && !intervalId) {
          intervalId = setInterval(async () => {
            const { orders: freshData } = await orderService.getOrdersByRestaurant(selectedRestaurant.id);
            setOrders(freshData);
          }, 30000);
        }
      };
      
      loadOrders();
      
      return () => {
        if (intervalId) clearInterval(intervalId);
      };
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

  const handleStatusChange = async (orderId: string, newStatus: 'cooking' | 'ready' | 'picked_up') => {
    // Optimistic update
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );

    // Call API (will update cached mock data if API unavailable)
    const success = await orderService.updateOrderStatus(orderId, newStatus);
    
    if (!success) {
      // Revert on failure
      console.error('Failed to update order status, reverting');
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: order.status } : order
        )
      );
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto border-4 border-gray-300 border-t-green-600 rounded-full animate-spin"></div>
          <div className="text-gray-600 font-medium">Loading restaurants...</div>
        </div>
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
              onStatusChange={handleStatusChange}
              colorClass="bg-gradient-to-r from-gray-500 to-gray-600"
            />
            <OrderColumn
              title="Cooking"
              status="cooking"
              orders={filteredOrders}
              onStatusChange={handleStatusChange}
              colorClass="bg-gradient-to-r from-emerald-400 to-teal-500"
            />
            <OrderColumn
              title="Ready"
              status="ready"
              orders={filteredOrders}
              onStatusChange={handleStatusChange}
              colorClass="bg-gradient-to-r from-blue-500 to-indigo-600"
            />
            <OrderColumn
              title="Picked Up"
              status="picked_up"
              orders={filteredOrders}
              colorClass="bg-gradient-to-r from-purple-500 to-pink-600"
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4 p-8">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                <Package className="h-10 w-10 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No Restaurant Selected</h3>
                <p className="text-sm text-gray-500">
                  Please select a restaurant from the dropdown to view orders
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
