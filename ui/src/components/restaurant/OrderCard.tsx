import { Clock, Battery } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Order } from '@/types/restaurant';

interface OrderCardProps {
  order: Order;
  onStatusChange?: (orderId: string, newStatus: 'cooking' | 'ready' | 'picked_up') => void;
}

export function OrderCard({ order, onStatusChange }: OrderCardProps) {
  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const getMinutesFromNow = (date: Date): number => {
    const now = new Date();
    const diff = Math.floor((date.getTime() - now.getTime()) / 1000 / 60);
    return diff;
  };

  const maxPrepTime = Math.max(...order.items.map((item) => item.preparationTime));
  const startCookingTime = new Date(order.customerETA);
  startCookingTime.setMinutes(startCookingTime.getMinutes() - maxPrepTime);

  const etaMinutes = getMinutesFromNow(order.customerETA);
  const etaText = etaMinutes >= 0 ? `in ${etaMinutes} min` : `${Math.abs(etaMinutes)} min ago`;

  return (
    <Card className="p-4 shadow-md hover:shadow-lg transition-shadow">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <span>Order #<strong>{order.orderNumber}</strong></span>
        </div>

        {/* Customer ETA or Current Charge */}
        {order.status === 'picked_up' ? (
          <div className="flex items-center gap-2 text-gray-600">
            <Battery className="h-4 w-4" />
            <span>Current charge: {order.chargePercentage ?? 0}%</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Customer arrives: {etaText} ({formatTime(order.customerETA)})</span>
          </div>
        )}

        <Separator />

        {/* Items */}
        <div className="space-y-2">
          {order.items.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">{item.name}</span>
                <Badge variant="secondary" className="text-xs">
                  x{item.quantity}
                </Badge>
              </div>
              <span className="text-gray-500 text-sm">{item.preparationTime} min</span>
            </div>
          ))}
        </div>

        {/* Start Cooking Time - only show for pending and cooking orders */}
        {(order.status === 'pending' || order.status === 'cooking') && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Start cooking at:</span>
              <span className="text-orange-600">
                {formatTime(startCookingTime)}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {order.status === 'pending' && onStatusChange && (
          <Button
            onClick={() => onStatusChange(order.id, 'cooking')}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            Start Cooking
          </Button>
        )}

        {order.status === 'cooking' && onStatusChange && (
          <Button
            onClick={() => onStatusChange(order.id, 'ready')}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Mark as Ready
          </Button>
        )}

        {order.status === 'ready' && onStatusChange && (
          <Button
            onClick={() => onStatusChange(order.id, 'picked_up')}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Mark as Picked Up
          </Button>
        )}
      </div>
    </Card>
  );
}
