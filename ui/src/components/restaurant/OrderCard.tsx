import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { displayTimeInHelsinki } from "@/lib/timeDisplay";
import { Order } from "@/types/restaurant";
import { Battery, Clock } from "lucide-react";
import { useEffect, useState } from "react";

// Helper functions
const getMinutesFromNow = (date: Date | string): number => {
  const eventDate = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  return Math.floor((eventDate.getTime() - now.getTime()) / 1000 / 60);
};

// formating the eta into more readable string like "2 hrs 15 mins" instead of minutes.
const formatEtaDifference = (minutesFromNow: number): string => {
  const isFuture = minutesFromNow >= 0;
  const absoluteMinutes = Math.abs(minutesFromNow);
  const hours = Math.floor(absoluteMinutes / 60);
  const minutes = absoluteMinutes % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} hr${hours === 1 ? "" : "s"}`);
  if (minutes > 0) parts.push(`${minutes} min${minutes === 1 ? "" : "s"}`);

  if (parts.length === 0) return "now";

  const formatted = parts.join(" ");
  return isFuture ? `in ${formatted}` : `${formatted} ago`;
};

// Component helpers
const ChargingStatus = ({
  chargePercentage = 0,
}: {
  chargePercentage?: number;
}) => (
  <div className="relative p-4 rounded-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 overflow-hidden">
    <div className="relative z-10 flex items-start gap-3">
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shrink-0">
        <Battery className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1">
        <div className="text-xs text-blue-600 font-medium mb-1">
          Charging Status
        </div>
        <div className="text-sm text-gray-700 font-medium">
          Current charge:{" "}
          <span className="text-blue-700 font-semibold">
            {chargePercentage}%
          </span>
        </div>
      </div>
    </div>
    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/30 rounded-full -mr-8 -mt-8"></div>
  </div>
);

const ETACountdown = ({
  etaText,
  etaTime,
}: {
  etaText: string;
  etaTime: string;
}) => (
  <div className="relative p-4 rounded-xl border-2 border-gray-200 bg-gray-50">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-full bg-gray-100">
        <Clock className="h-6 w-6 text-gray-600" />
      </div>
      <div className="flex-1">
        <div className="text-xs text-gray-600 mb-1">Customer Arrives</div>
        <div className="text-2xl font-bold text-gray-900">{etaText}</div>
        <div className="text-sm text-gray-600 mt-1">at {etaTime}</div>
      </div>
    </div>
  </div>
);

interface OrderCardProps {
  order: Order;
  onStatusChange?: (
    orderId: string,
    newStatus: "cooking" | "ready" | "picked_up"
  ) => void;
}

export function OrderCard({ order, onStatusChange }: OrderCardProps) {
  // Force re-render every minute to update countdown
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 60000); // Update every 60 seconds

    return () => clearInterval(timer);
  }, []);

  const maxPrepTime = Math.max(
    ...order.items.map((item) => item.preparationTime)
  );
  const startCookingTime = new Date(order.customerETA);
  startCookingTime.setMinutes(startCookingTime.getMinutes() - maxPrepTime);

  const etaMinutes = getMinutesFromNow(order.customerETA);
  const etaText = formatEtaDifference(etaMinutes);

  return (
    <Card className="p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-300 bg-white">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <span className="text-sm text-gray-600">
            Order #
            <strong className="text-gray-900 font-semibold">
              {order.orderNumber}
            </strong>
          </span>
        </div>

        {/* Customer ETA or current charge */}
        {order.status === "picked_up" ? (
          <ChargingStatus chargePercentage={order.chargePercentage} />
        ) : (
          <ETACountdown
            etaText={etaText}
            etaTime={displayTimeInHelsinki(order.customerETA)}
          />
        )}

        <Separator />

        {/* Items */}
        <div className="space-y-2">
          {order.items.map((item) => (
            <div
              key={`${order.id}-${item.name}-${item.quantity}`}
              className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  {item.name}
                </span>
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  x{item.quantity}
                </Badge>
              </div>
              <span className="text-xs text-gray-500 font-medium">
                {item.preparationTime} min
              </span>
            </div>
          ))}
        </div>

        {/* Start Cooking Time - only show for pending and cooking orders */}
        {(order.status === "pending" || order.status === "cooking") && (
          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm px-2">
              <span className="text-gray-600">Start cooking at:</span>
              <span className="text-orange-600 font-semibold">
                {displayTimeInHelsinki(startCookingTime)}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {order.status === "cooking" && onStatusChange && (
          <Button
            onClick={() => onStatusChange(order.id, "ready")}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-md hover:shadow-lg transition-all"
          >
            Mark as Ready
          </Button>
        )}

        {order.status === "ready" && onStatusChange && (
          <Button
            onClick={() => onStatusChange(order.id, "picked_up")}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium shadow-md hover:shadow-lg transition-all"
          >
            Mark as Picked Up
          </Button>
        )}
      </div>
    </Card>
  );
}
