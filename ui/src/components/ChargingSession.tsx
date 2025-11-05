import { useState, useEffect } from "react";
import {
  ChargingSessionType,
  RestaurantOrder,
  ChargingStation,
} from "@/pages/home";
import { PlannedJourney } from "@/pages/home";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import {
  Zap,
  MapPin,
  Clock,
  DollarSign,
  Battery,
  TrendingUp,
  StopCircle,
  History,
  UtensilsCrossed,
  CheckCircle,
  Route,
  Flag,
  Navigation,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";

type ChargingSessionProps = {
  activeSession: ChargingSessionType | null;
  onEndSession: () => void;
  restaurantOrders: RestaurantOrder[];
  onUpdateOrderStatus: (
    orderId: string,
    status: RestaurantOrder["status"],
  ) => void;
  isJourneyActive?: boolean;
  plannedJourney?: PlannedJourney | null;
  onStartCharging?: (station: ChargingStation) => void | null;
};

export function ChargingSession({
  activeSession,
  onEndSession,
  restaurantOrders,
  onUpdateOrderStatus,
  isJourneyActive = false,
  plannedJourney = null,
  onStartCharging,
}: ChargingSessionProps) {
  const [energyDelivered, setEnergyDelivered] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [batteryLevel, setBatteryLevel] = useState(45);

  useEffect(() => {
    if (activeSession?.status === "active") {
      const interval = setInterval(() => {
        setEnergyDelivered((prev) => Math.min(prev + 0.5, 60));
        setElapsedTime((prev) => prev + 1);
        setBatteryLevel((prev) => Math.min(prev + 0.2, 100));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [activeSession]);

  const handleStartCharging = () => {
    if (plannedJourney && onStartCharging) {
      onStartCharging(plannedJourney.stops[0].station);
    }
  };

  // Simulate restaurant order status progression
  useEffect(() => {
    const interval = setInterval(() => {
      restaurantOrders.forEach((order) => {
        const timeSinceOrder =
          Date.now() - order.orderTime.getTime();

        if (
          order.status === "pending" &&
          timeSinceOrder > 30000
        ) {
          onUpdateOrderStatus(order.id, "cooking");
        }
        else if (
          order.status === "cooking" &&
          timeSinceOrder > 60000
        ) {
          onUpdateOrderStatus(order.id, "ready");
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [restaurantOrders, onUpdateOrderStatus]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const currentCost = energyDelivered * 0.35;
  const chargingSpeed = 45; // kW
  const estimatedTimeRemaining =
    ((100 - batteryLevel) / 100) * 60 * 60; // seconds

  return (
    <div className="min-h-[calc(100vh-120px)] bg-gray-50">
      <Tabs defaultValue="active" className="w-full">
        <div className="bg-white border-b">
          <TabsList className="w-full justify-start rounded-none bg-transparent p-0">
            {isJourneyActive && (
              <TabsTrigger
                value="journey"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-600"
              >
                Order
              </TabsTrigger>
            )}
            <TabsTrigger
              value="active"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-600"
            >
              Charging
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="active" className="m-0">
          <div className="p-4 space-y-4">
            {activeSession?.status === "active" ? (
              <>
                <Card className="p-4 bg-green-50 border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white fill-white" />
                      </div>
                      <div>
                        <h3>{activeSession.stationName}</h3>
                        <Badge className="bg-green-600 mt-1">
                          Charging in Progress
                        </Badge>
                      </div>
                    </div>
                    <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse" />
                  </div>
                </Card>

                {plannedJourney && (
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <div className="flex items-start gap-2">
                      <Navigation className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">
                          Your charger reservation ends at{" "}
                          {new Date(
                            plannedJourney.stops[0].estimatedArrivalTime.getTime() +
                              Math.floor(
                                estimatedTimeRemaining * 1000,
                              ),
                          ).toLocaleTimeString("en-GB", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

                <Card className="p-6">
                  <div className="text-center flex justify-between mb-4">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-3">
                      <Battery className="w-12 h-12 text-green-600" />
                    </div>
                    <span className="text-4xl mb-1">
                      {batteryLevel.toFixed(0)}%
                    </span>
                    <p className="text-gray-600">
                      Battery Level
                    </p>
                  </div>
                  <Progress
                    value={batteryLevel}
                    className="h-3"
                  />
                </Card>

                <div className="grid grid-cols-2 gap-3">
                  <Card className="p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Zap className="w-4 h-4" />
                      <span className="text-sm">
                        Energy Delivered
                      </span>
                    </div>
                    <div className="text-2xl">
                      {energyDelivered.toFixed(1)}{" "}
                      <span className="text-sm text-gray-600">
                        kWh
                      </span>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm">
                        Current Cost
                      </span>
                    </div>
                    <div className="text-2xl">
                      ${currentCost.toFixed(2)}{" "}
                      <span className="text-sm text-gray-600">
                        USD
                      </span>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">
                        Elapsed Time
                      </span>
                    </div>
                    <div className="text-2xl">
                      {formatTime(elapsedTime)}
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">
                        Charging Speed
                      </span>
                    </div>
                    <div className="text-2xl">
                      {chargingSpeed}{" "}
                      <span className="text-sm text-gray-600">
                        kW
                      </span>
                    </div>
                  </Card>
                </div>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">
                      Est. Time to Full
                    </span>
                    <span>
                      {Math.floor(estimatedTimeRemaining / 60)}{" "}
                      min
                    </span>
                  </div>
                </Card>

                <Button
                  variant="destructive"
                  size="lg"
                  className="w-full"
                  onClick={onEndSession}
                >
                  <StopCircle className="w-5 h-5 mr-2" />
                  Stop Charging
                </Button>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  Add 10 minutes to Reservation
                </Button>

                <p className="text-xs text-center text-gray-500">
                  You will be charged for the energy delivered
                  up to this point
                </p>
              </>
            ) : (
              <>
                <Card className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <Zap className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="mb-2">
                    No Active Charging Session
                  </h3>

                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                    onClick={handleStartCharging}
                  >
                    Start charging
                  </Button>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        {isJourneyActive && plannedJourney && (
          <TabsContent value="journey" className="m-0">
            <div className="p-4 space-y-4">
              <Card className="p-4 bg-green-50 border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <Route className="w-5 h-5 text-green-600" />
                  <h3>Journey in Progress</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">From</span>
                    <span>{plannedJourney.startLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">To</span>
                    <span>
                      {plannedJourney.stops[0].station.name}
                    </span>
                    <p className="text-sm text-gray-600">
                      {plannedJourney.stops[0].station.address}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div>
                      <div className="text-gray-600 mb-1">
                        Distance
                      </div>
                      <div>
                        {
                          plannedJourney.stops[0]
                            .distanceFromStart
                        }{" "}
                        km
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">
                        ETA
                      </div>
                      <div>
                        {plannedJourney.stops[0].estimatedArrivalTime.toLocaleTimeString(
                          "en-GB",
                          {
                            hour: "numeric",
                            minute: "2-digit",
                          },
                        )}
                      </div>
                    </div>
                    <div>
                      A CCS charger number 2 is reserved for you
                      for{" "}
                      {plannedJourney.stops[0].estimatedArrivalTime.toLocaleTimeString(
                        "en-GB",
                        {
                          hour: "numeric",
                          minute: "2-digit",
                        },
                      )}
                      -
                      {new Date(
                        plannedJourney.stops[0].estimatedArrivalTime.getTime() +
                          30 * 60 * 1000,
                      ).toLocaleTimeString("en-GB", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="flex justify-between">
                    </div>
                  </div>
                </div>
              </Card>

              {true && (
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <div className="flex items-start gap-2">
                    <Navigation className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">
                        Your charger reservation has been pushed
                        forward to{" "}
                        {new Date(
                          plannedJourney.stops[0].estimatedArrivalTime.getTime() +
                            10 * 60 * 1000,
                        ).toLocaleTimeString("en-GB", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                        -
                        {new Date(
                          plannedJourney.stops[0].estimatedArrivalTime.getTime() +
                            40 * 60 * 1000,
                        ).toLocaleTimeString("en-GB", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {restaurantOrders.filter((o) =>
                ["pending", "cooking", "ready"].includes(
                  o.status,
                ),
              ).length > 0 && (
                <Card className="p-4 bg-orange-50 border-orange-200">
                  <div className="flex items-center gap-2 mb-3">
                    <UtensilsCrossed className="w-5 h-5 text-orange-600" />
                    <h3>Food Orders</h3>
                  </div>
                  {restaurantOrders
                    .filter((o) =>
                      ["pending", "cooking", "ready"].includes(
                        o.status,
                      ),
                    )
                    .map((order) => (
                      <div
                        key={order.id}
                        className="mb-2 last:mb-0"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span>{order.restaurantName}</span>
                          <Badge
                            variant={
                              order.status === "ready"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              order.status === "ready"
                                ? "bg-green-600"
                                : ""
                            }
                          >
                            {order.status === "ready"
                              ? "Ready for Pickup!"
                              : order.status === "cooking"
                                ? "Preparing..."
                                : "Order Placed"}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          {order.items.reduce(
                            (sum, item) => sum + item.quantity,
                            0,
                          )}{" "}
                          {order.items.length === 1
                            ? "item"
                            : "items"}{" "}
                          • ${order.totalCost.toFixed(2)}
                        </div>
                        <div>
                          <span>Your order number is 574</span>
                        </div>
                      </div>
                    ))}
                </Card>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
