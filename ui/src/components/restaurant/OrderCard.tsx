import { useState, useEffect } from 'react';
import { Clock, Battery, Timer, AlertCircle, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Order } from '@/types/restaurant';

interface OrderCardProps {
  order: Order;
  onStatusChange?: (orderId: string, newStatus: 'cooking' | 'ready' | 'picked_up') => void;
}

export function OrderCard({ order, onStatusChange }: OrderCardProps) {
  // Force re-render every minute to update countdown
  const [, setTick] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(prev => prev + 1);
    }, 60000); // Update every 60 seconds
    
    return () => clearInterval(timer);
  }, []);
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
  
  // Determine urgency level for visual styling
  const getUrgencyLevel = () => {
    if (etaMinutes < 0) return 'overdue'; // Past ETA
    if (etaMinutes <= 5) return 'urgent'; // 5 minutes or less
    if (etaMinutes <= 15) return 'soon'; // 15 minutes or less
    return 'normal'; // More than 15 minutes
  };
  
  const urgencyLevel = getUrgencyLevel();
  
  // Get color scheme based on urgency
  const getUrgencyStyles = () => {
    switch (urgencyLevel) {
      case 'overdue':
        return {
          bg: 'bg-red-50',
          border: 'border-red-300',
          text: 'text-red-700',
          icon: 'text-red-600',
          badge: 'bg-red-100 text-red-700 border-red-300',
          animate: 'animate-pulse'
        };
      case 'urgent':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-300',
          text: 'text-orange-700',
          icon: 'text-orange-600',
          badge: 'bg-orange-100 text-orange-700 border-orange-300',
          animate: 'animate-pulse'
        };
      case 'soon':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-300',
          text: 'text-yellow-700',
          icon: 'text-yellow-600',
          badge: 'bg-yellow-100 text-yellow-700 border-yellow-300',
          animate: ''
        };
      default:
        return {
          bg: 'bg-green-50',
          border: 'border-green-300',
          text: 'text-green-700',
          icon: 'text-green-600',
          badge: 'bg-green-100 text-green-700 border-green-300',
          animate: ''
        };
    }
  };
  
  const urgencyStyles = getUrgencyStyles();
  
  // Calculate progress percentage (time until arrival)
  const getProgressPercentage = () => {
    const totalMinutes = 30; // Assume 30 min window for visualization
    const remaining = Math.max(0, Math.min(etaMinutes, totalMinutes));
    return ((totalMinutes - remaining) / totalMinutes) * 100;
  };

  return (
    <Card className="p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-300 bg-white">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <span className="text-sm text-gray-600">
            Order #<strong className="text-gray-900 font-semibold">{order.orderNumber}</strong>
          </span>
        </div>

        {/* Customer ETA - Enhanced Visual Display */}
        {order.status === 'picked_up' ? (
          <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
            <Battery className="h-5 w-5 text-gray-600" />
            <span className="text-sm text-gray-700 font-medium">Current charge: {order.chargePercentage ?? 0}%</span>
          </div>
        ) : (
          <div className={`relative p-4 rounded-xl border-2 ${urgencyStyles.bg} ${urgencyStyles.border} ${urgencyStyles.animate}`}>
            {/* Urgency Badge */}
            {urgencyLevel === 'overdue' && (
              <Badge variant="outline" className={`absolute -top-2 -right-2 ${urgencyStyles.badge} font-semibold`}>
                OVERDUE
              </Badge>
            )}
            {urgencyLevel === 'urgent' && (
              <Badge variant="outline" className={`absolute -top-2 -right-2 ${urgencyStyles.badge} font-semibold`}>
                URGENT
              </Badge>
            )}
            
            {/* Main ETA Display */}
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${urgencyStyles.bg}`}>
                <Clock className={`h-6 w-6 ${urgencyStyles.icon}`} />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-600 mb-1">Customer Arrives</div>
                <div className={`text-2xl font-bold ${urgencyStyles.text}`}>
                  {etaText}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  at {formatTime(order.customerETA)}
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-3">
              <Progress 
                value={getProgressPercentage()} 
                className={`h-2 ${urgencyStyles.bg}`}
              />
            </div>
            
            {/* Time-based message */}
            {urgencyLevel === 'overdue' && (
              <div className="mt-2 text-xs text-red-600 font-medium flex items-center gap-1">
                <TrendingDown className="h-3 w-3" />
                Customer is late - food may be getting cold
              </div>
            )}
            {urgencyLevel === 'urgent' && (
              <div className="mt-2 text-xs text-orange-600 font-medium flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Customer arriving very soon!
              </div>
            )}
            {urgencyLevel === 'soon' && (
              <div className="mt-2 text-xs text-yellow-700 font-medium flex items-center gap-1">
                <Timer className="h-3 w-3" />
                Ensure order is ready soon
              </div>
            )}
          </div>
        )}

        <Separator />

        {/* Items */}
        <div className="space-y-2">
          {order.items.map((item, index) => (
            <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">{item.name}</span>
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  x{item.quantity}
                </Badge>
              </div>
              <span className="text-xs text-gray-500 font-medium">{item.preparationTime} min</span>
            </div>
          ))}
        </div>

        {/* Start Cooking Time - only show for pending and cooking orders */}
        {(order.status === 'pending' || order.status === 'cooking') && (
          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm px-2">
              <span className="text-gray-600">Start cooking at:</span>
              <span className="text-orange-600 font-semibold">
                {formatTime(startCookingTime)}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {order.status === 'pending' && onStatusChange && (
          <Button
            onClick={() => onStatusChange(order.id, 'cooking')}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium shadow-md hover:shadow-lg transition-all"
          >
            Start Cooking
          </Button>
        )}

        {order.status === 'cooking' && onStatusChange && (
          <Button
            onClick={() => onStatusChange(order.id, 'ready')}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-md hover:shadow-lg transition-all"
          >
            Mark as Ready
          </Button>
        )}

        {order.status === 'ready' && onStatusChange && (
          <Button
            onClick={() => onStatusChange(order.id, 'picked_up')}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium shadow-md hover:shadow-lg transition-all"
          >
            Mark as Picked Up
          </Button>
        )}
      </div>
    </Card>
  );
}
