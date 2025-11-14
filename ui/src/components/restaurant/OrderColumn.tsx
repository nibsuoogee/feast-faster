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
    <div className="flex flex-col h-full rounded-lg bg-white overflow-hidden border border-gray-200 transition-all duration-200 hover:border-gray-300 hover:shadow-lg">
      <div className={`${colorClass} text-white p-4 shrink-0`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Icon className="h-4 w-4" />
            </div>
            <span className="font-semibold text-base">{title}</span>
          </div>
          <div className="bg-white/90 text-gray-900 rounded-lg px-3 py-1 text-sm font-bold shadow-sm">
            {filteredOrders.length}
          </div>
        </div>
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
              <Icon className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No {title.toLowerCase()} orders</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
