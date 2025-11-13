import { Order, OrderStatus } from '@/types/restaurant';
import { OrderCard } from './OrderCard';
import { ScrollArea } from '@/components/ui/scroll-area';

interface OrderColumnProps {
  title: string;
  status: OrderStatus;
  orders: Order[];
  onStatusChange?: (orderId: string, newStatus: 'ready' | 'picked_up') => void;
  colorClass: string;
}

export function OrderColumn({
  title,
  status,
  orders,
  onStatusChange,
  colorClass,
}: OrderColumnProps) {
  const filteredOrders = orders.filter((order) => order.status === status);

  return (
    <div className="flex flex-col h-full border rounded-lg bg-gray-50">
      <div className={`${colorClass} text-white p-4 rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <span>{title}</span>
          <span className="bg-white/20 rounded-full px-3 py-1">
            {filteredOrders.length}
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusChange={onStatusChange}
            />
          ))}
          {filteredOrders.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              No {title.toLowerCase()} orders
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
