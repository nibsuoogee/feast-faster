import { Order, OrderStatus } from '@/types/restaurant';
import { OrderCard } from './OrderCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Flame, CheckCircle, Package } from 'lucide-react';

interface OrderColumnProps {
  title: string;
  status: OrderStatus;
  orders: Order[];
  onStatusChange?: (orderId: string, newStatus: 'ready' | 'picked_up') => void;
  colorClass: string;
}

// Map status to icons
const statusIcons = {
  pending: Clock,
  cooking: Flame,
  ready: CheckCircle,
  picked_up: Package,
};

// Map status to workflow progress (1-4)
const statusProgress = {
  pending: 1,
  cooking: 2,
  ready: 3,
  picked_up: 4,
};

export function OrderColumn({
  title,
  status,
  orders,
  onStatusChange,
  colorClass,
}: OrderColumnProps) {
  const filteredOrders = orders.filter((order) => order.status === status);
  const Icon = statusIcons[status];
  const progress = statusProgress[status];

  return (
    <div className="flex flex-col h-full rounded-xl bg-white overflow-hidden border border-gray-200 transition-all duration-200 hover:border-gray-300 hover:shadow-lg">
      <div className={`${colorClass} text-white px-6 py-4 shadow-lg relative overflow-hidden`}>
        <div className="relative z-10 flex items-center justify-between">
          <span className="font-medium text-lg">{title}</span>
          <span className="bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
            {filteredOrders.length}
          </span>
        </div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8"></div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="space-y-3 p-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusChange={onStatusChange}
            />
          ))}
          {filteredOrders.length === 0 && (
            <div className="text-center text-gray-400 py-12">
              <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-2xl flex items-center justify-center">
                <Icon className="h-8 w-8 text-gray-300" />
              </div>
              <p className="text-sm text-gray-500">No {title.toLowerCase()} orders</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
