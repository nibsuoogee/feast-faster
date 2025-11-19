import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/restaurant/DashboardHeader';
import { OrderColumn } from '@/components/restaurant/OrderColumn';
import { Restaurant, Order } from '@/types/restaurant';
import { Package } from 'lucide-react';
import { orderService } from '@/services/orders';

// Column configuration
const ORDER_COLUMNS = [
  {
    title: 'Pending',
    status: 'pending' as const,
    colorClass: 'bg-gradient-to-r from-gray-500 to-gray-600',
  },
  {
    title: 'Cooking',
    status: 'cooking' as const,
    colorClass: 'bg-gradient-to-r from-emerald-400 to-teal-500',
  },
  {
    title: 'Ready',
    status: 'ready' as const,
    colorClass: 'bg-gradient-to-r from-blue-500 to-indigo-600',
  },
  {
    title: 'Picked Up',
    status: 'picked_up' as const,
    colorClass: 'bg-gradient-to-r from-purple-500 to-pink-600',
  },
];

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
    } else {
      setOrders([]);
    }
  }, [selectedRestaurant]);

  const activeOrdersCount = orders.filter(
    (order) =>
      order.status === 'pending' ||
      order.status === 'cooking' ||
      order.status === 'ready'
  ).length;

  const handleStatusChange = async (orderId: string, newStatus: 'cooking' | 'ready' | 'picked_up') => {
    // Store original status for potential revert
    const originalOrder = orders.find((order) => order.id === orderId);
    if (!originalOrder) return;

    // Optimistic update
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );

    // Update mock data (persists in memory via module caching)
    const success = await orderService.updateOrderStatus(orderId, newStatus);
    if (!success) {
      // Revert on failure using stored original status
      console.error('Failed to update order status, reverting');
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: originalOrder.status } : order
        )
      );
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto border-4 border-gray-300 border-t-green-600 rounded-full animate-spin"></div>
          <div className="text-gray-600 font-medium">Loading restaurants...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <DashboardHeader
        restaurants={restaurants}
        selectedRestaurant={selectedRestaurant}
        onSelectRestaurant={setSelectedRestaurant}
        activeOrdersCount={activeOrdersCount}
        userName="Restaurant Manager"
      />

      <main className="flex-1 p-6 overflow-hidden">
        {selectedRestaurant ? (
          <div className="grid grid-cols-4 gap-5 h-full">
            {ORDER_COLUMNS.map((column) => (
              <OrderColumn
                key={column.status}
                title={column.title}
                status={column.status}
                orders={orders}
                onStatusChange={column.status !== 'picked_up' ? handleStatusChange : undefined}
                colorClass={column.colorClass}
              />
            ))}
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