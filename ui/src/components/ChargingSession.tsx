import { useStateContext } from "@/contexts/StateContext";
import { displayTimeInHelsinki } from "@/lib/timeDisplay";
import { orderModel, reservationModel } from "@/models";
import { chargingService } from "@/services/charger";
import { useUserLocation } from "@/services/geocode";
import {
  reservationService,
  RouteResponseModel,
  routeResponseModel,
} from "@/services/reservations";
import { PlannedJourney } from "@/types/driver";
import {
  Battery,
  Clock,
  Euro,
  Navigation,
  Route,
  SkipBack,
  StopCircle,
  TestTube2,
  TrendingUp,
  UtensilsCrossed,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Slider } from "./ui/slider";
import { orderService } from "@/services/order";
import { toast } from "sonner";

type ChargingSessionProps = {
  isJourneyActive?: boolean;
  plannedJourney?: PlannedJourney | null;
};

export function ChargingSession({
  isJourneyActive = false,
  plannedJourney = null,
}: ChargingSessionProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [canExtend, setCanExtend] = useState<boolean>(false);
  const [isCheckingExtension, setIsCheckingExtension] = useState(false);
  const [isStoppingCharging, setIsStoppingCharging] = useState(false);
  const [activeView, setActiveView] = useState<"order" | "charging">("order");
  const [socAtArrival, setSocAtArrival] = useState<number>(0);
  const [distanceToStation, setDistanceToStation] = useState<number>(0);
  const {
    contextReservation,
    contextOrder,
    contextOrderItems,
    contextRestaurant,
    contextStationName,
    contextChargingState,
    setContextReservation,
    setContextOrder,
    resetContext,
  } = useStateContext();
  const [route, setRoute] = useState<RouteResponseModel | undefined>(undefined);
  const [routeStep, setRouteStep] = useState<number>(0);
  const [lateness, setLateness] = useState<number>(0);
  const currentUserLocation = useUserLocation();

  const food_status_badges = {
    pending: { className: "bg-blue-200", text: "Order placed" },
    cooking: { className: "bg-green-200", text: "Cooking" },
    ready: { className: "bg-red-200", text: "Ready" },
    picked_up: { className: "bg-gray-200", text: "Picked up" },
  };

  useEffect(() => {
    if (!plannedJourney || !contextRestaurant?.station_id) return;

    // Find the stop that matches the contextRestaurant's station_id
    const matchingStop = plannedJourney.stops.find(
      (stop) => stop.station.station_id === contextRestaurant.station_id
    );

    if (matchingStop) {
      setSocAtArrival(matchingStop.station.soc_at_arrival);
      setDistanceToStation(matchingStop.distanceFromStart);
    } else {
      console.warn(
        `No matching station found for station_id: ${contextRestaurant.station_id}`
      );
    }
  }, [plannedJourney, contextRestaurant?.station_id]);

  // Auto-switch to Order view when an order is placed
  useEffect(() => {
    if (contextOrder?.order_id) {
      setActiveView("order");
    }
  }, [contextOrder?.order_id]);

  async function getNewRoute() {
    if (!contextRestaurant?.station_id) return;
    if (!currentUserLocation) return;
    const { latitude, longitude } = currentUserLocation;
    if (!latitude || !longitude) return;

    const response = await reservationService.getRoute({
      station_id: contextRestaurant.station_id,
      source: [longitude, latitude],
      interval: 1,
    });

    const result = routeResponseModel.safeParse(response);
    if (!result.success) {
      console.error("Failed to parse route: ", result.error);
    } else {
      setRoute(result.data);
      console.log("result.data: ", result.data);
    }
  }

  useEffect(() => {
    getNewRoute();
  }, [currentUserLocation, contextRestaurant?.station_id]);

  async function myEta() {
    if (!contextReservation?.reservation_id) return;
    if (!contextOrder?.order_id) return;

    const response = await reservationService.myEta({
      reservation_id: contextReservation?.reservation_id,
      order_id: contextOrder?.order_id,
      lateness_in_minutes: lateness,
    });

    const orderResult = orderModel.safeParse(response?.order);
    if (!orderResult.success) {
      console.error("Failed to parse order: ", orderResult.error);
    } else {
      setContextOrder(orderResult.data);
    }

    const reservationResult = reservationModel.safeParse(response?.reservation);
    if (!reservationResult.success) {
      console.error("Failed to parse order: ", reservationResult.error);
    } else {
      setContextReservation(reservationResult.data);
    }
  }

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  async function startCharging() {
    if (!contextReservation || !contextOrder) return;

    chargingService.startCharging({
      charger_id: contextReservation.charger_id,
      current_soc: socAtArrival,
      user_id: contextOrder.customer_id,
      rate_of_charge: 0.5,
    });
  }

  const chargingSpeed = 45;

  useEffect(() => {
    if (!contextReservation?.charge_start_time) return;

    const interval = setInterval(() => {
      if (contextChargingState === "finished") {
        clearInterval(interval);
        return;
      }
      if (!contextReservation.charge_start_time) return;

      const startTime = new Date(
        contextReservation.charge_start_time
      ).getTime();
      const currentTime = new Date().getTime();
      const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);

      setElapsedTime(Math.max(0, elapsedSeconds));
    }, 1000);

    return () => clearInterval(interval);
  }, [contextReservation?.charge_start_time, contextChargingState]);

  // Calculate time remaining until reservation ends
  useEffect(() => {
    if (!contextReservation?.reservation_end) {
      setTimeRemaining(null);
      return;
    }

    const updateTimeRemaining = () => {
      const endTime = new Date(contextReservation.reservation_end).getTime();
      const currentTime = new Date().getTime();
      const remainingMs = endTime - currentTime;
      const remainingMinutes = Math.floor(remainingMs / 1000 / 60);

      setTimeRemaining(Math.max(0, remainingMinutes));
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [contextReservation?.reservation_end]);

  // Check if reservation can be extended when time is low
  useEffect(() => {
    const checkExtension = async () => {
      if (
        !contextReservation?.reservation_id ||
        timeRemaining === null ||
        timeRemaining > 10
      ) {
        setCanExtend(false);
        return;
      }

      setIsCheckingExtension(true);
      try {
        const response = await reservationService.canExtendReservation(
          contextReservation.reservation_id
        );
        setCanExtend(response?.can_extend ?? false);
      } catch (error) {
        console.error("Failed to check extension eligibility:", error);
        setCanExtend(false);
      } finally {
        setIsCheckingExtension(false);
      }
    };

    checkExtension();
  }, [contextReservation?.reservation_id, timeRemaining]);

  const handleStopCharging = async () => {
    if (!contextReservation?.charger_id || !contextReservation?.reservation_id)
      return;

    setIsStoppingCharging(true);
    try {
      await reservationService.finishCharging(
        contextReservation.charger_id,
        contextReservation.reservation_id
      );
      // The charging_paid event from SSE will update the UI
    } catch (error) {
      console.error("Failed to stop charging:", error);
    } finally {
      setIsStoppingCharging(false);
    }
  };

  async function cancelOrder() {
    if (!contextOrder?.order_id) return;

    const result = await orderService.deleteOrder(contextOrder.order_id);
    if (result?.success) {
      toast.success(
        "Your order was cancelled and you were successfully refunded."
      );

      resetContext();
    }
  }

  return (
    <div className="min-h-[calc(100vh-120px)] bg-gray-50">
      {contextReservation || contextOrder ? (
        <>
          {/* Toggle buttons for Order/Charging views */}
          <div className="bg-white border-b">
            <div className="flex">
              <button
                onClick={() => setActiveView("order")}
                className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                  activeView === "order"
                    ? "border-green-600 text-green-600 font-semibold"
                    : "border-transparent text-gray-600"
                }`}
              >
                Order
              </button>
              <button
                onClick={() => setActiveView("charging")}
                className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                  activeView === "charging"
                    ? "border-green-600 text-green-600 font-semibold"
                    : "border-transparent text-gray-600"
                }`}
              >
                Charging
              </button>
            </div>
          </div>

          {/* Order View */}
          {activeView === "order" && (
            <div className="p-4 space-y-4">
              {/* Journey in Progress */}
              {contextReservation && (
                <Card className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                      <Route className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold">Journey in Progress</h3>
                    </div>

                    {/* From/To */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-start gap-2">
                        <Navigation className="w-4 h-4 text-gray-400 mt-1" />
                        <div>
                          <div className="text-xs text-gray-500">From</div>
                          <div className="font-medium">
                            {currentUserLocation?.address || "Current Location"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Navigation className="w-4 h-4 text-green-600 mt-1" />
                        <div>
                          <div className="text-xs text-gray-500">To</div>
                          <div className="font-medium">
                            {contextStationName || "Station"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Reservation Details */}
                    <div className="space-y-2 pt-3 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Charger</span>
                        <span className="font-medium">
                          #{contextReservation.charger_id}
                        </span>
                      </div>
                      {distanceToStation && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Distance</span>
                          <span className="font-medium">
                            {distanceToStation.toFixed(0)} km
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Reservation Time</span>
                        <span className="font-medium">
                          {displayTimeInHelsinki(
                            contextReservation.reservation_start
                          )}{" "}
                          -{" "}
                          {displayTimeInHelsinki(
                            contextReservation.reservation_end
                          )}
                        </span>
                      </div>
                      {contextOrder?.customer_eta && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">ETA</span>
                          <span className="font-medium">
                            {displayTimeInHelsinki(contextOrder.customer_eta)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}
              {/* Order Details */}
              {contextOrder && contextRestaurant && contextOrderItems && (
                <Card className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <UtensilsCrossed className="w-5 h-5 text-green-600" />
                        <h3 className="font-semibold">Order Details</h3>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          food_status_badges[contextOrder.food_status].className
                        }
                      >
                        {food_status_badges[contextOrder.food_status].text}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Restaurant</span>
                        <span className="font-medium">
                          {contextRestaurant.name}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Address</span>
                        <span className="font-medium">
                          {contextRestaurant.address}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Order Number</span>
                        <span className="font-medium">
                          #{contextOrder.order_id}
                        </span>
                      </div>

                      {/* Order Items */}
                      <div className="pt-3 border-t">
                        <div className="text-sm font-medium mb-2">Items:</div>
                        <div className="space-y-2">
                          {contextOrderItems.map((item) => (
                            <div
                              key={item.order_item_id}
                              className="flex justify-between text-sm"
                            >
                              <span>
                                {item.quantity}x {item.name}
                              </span>
                              <span className="font-medium">
                                €{(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between text-sm pt-3 border-t font-semibold">
                        <span>Total</span>
                        <span className="text-green-600">
                          €{contextOrder.total_price.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full hover:bg-red-400"
                      onClick={cancelOrder}
                      disabled={undefined}
                    >
                      <SkipBack className="w-4 h-4 mr-2" />
                      Cancel order
                    </Button>
                  </div>
                </Card>
              )}

              {route && (
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <TestTube2 className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold">Mock driver progress</h3>
                  </div>

                  {/* Route Progress Slider */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16">Start</div>
                      <Slider
                        value={[routeStep]}
                        onValueChange={(value) => setRouteStep(value[0])}
                        min={0}
                        max={route?.length - 1}
                        step={1}
                        className="flex-1"
                      />
                      <div className="w-16 text-right">Station</div>
                    </div>

                    {/* Lateness Slider */}
                    <div className="flex items-center gap-3">
                      <div className="w-16">On time</div>
                      <Slider
                        value={[lateness]}
                        onValueChange={(value) => setLateness(value[0])}
                        min={0}
                        max={20}
                        step={1}
                        className="flex-1"
                      />
                      <div className="w-16 text-right">Late</div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Driving time</span>
                      <span className="font-medium">
                        {route[routeStep]?.time_min} minutes
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Distance</span>
                      <span className="font-medium">{"..."} km</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Lateness</span>
                      <span className="font-medium">{lateness} minutes</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full hover:bg-gray-300"
                    onClick={myEta}
                    disabled={undefined}
                  >
                    Send location update
                  </Button>
                </Card>
              )}
            </div>
          )}

          {/* Charging View */}
          {activeView === "charging" && (
            <div className="p-4 space-y-4">
              {contextReservation &&
              (contextChargingState === "active" ||
                contextChargingState === "finished" ||
                contextReservation.charge_start_time !== null) ? (
                <>
                  <Card className="p-4 bg-green-50 border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                          <Zap className="w-5 h-5 text-white fill-white" />
                        </div>
                        <div>
                          <h3>{contextStationName}</h3>
                          {contextChargingState === "active" && (
                            <Badge className="bg-green-600 mt-1">
                              Charging in Progress
                            </Badge>
                          )}
                          {contextChargingState === "finished" && (
                            <Badge className="bg-gray-100 mt-1">
                              Charging finished
                            </Badge>
                          )}
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
                            {contextReservation?.reservation_end &&
                              new Date(
                                contextReservation?.reservation_end
                              ).toLocaleTimeString("en-GB", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                          </p>
                        </div>
                      </div>
                    </Card>
                  )}

                  <Card className="p-6">
                    <div className="text-center flex justify-between mb-4 items-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
                        <Battery className="w-6 h-6 text-green-600" />
                      </div>
                      <span className="text-4xl mb-1">
                        {contextReservation?.current_soc &&
                          contextReservation?.current_soc.toFixed(0)}
                        %
                      </span>
                      <p className="text-gray-600">Battery Level</p>
                    </div>
                    <Progress
                      value={contextReservation?.current_soc}
                      className="h-3 bg-gray-300 [&>div]:bg-green-600"
                    />
                  </Card>

                  <div className="grid grid-cols-2 gap-3">
                    <Card className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <Zap className="w-4 h-4" />
                          <span className="text-sm">Energy Delivered</span>
                        </div>
                        <div className="text-2xl">
                          {contextReservation?.cumulative_power &&
                            contextReservation?.cumulative_power.toFixed(
                              1
                            )}{" "}
                          <span className="text-sm text-gray-600">kWh</span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <Euro className="w-4 h-4" />
                          <span className="text-sm">Current Cost</span>
                        </div>
                        <div className="text-2xl">
                          €
                          {contextReservation?.cumulative_price_of_charge?.toFixed(
                            2
                          )}{" "}
                          <span className="text-sm text-gray-600">EUR</span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">Elapsed Time</span>
                        </div>
                        <div className="text-2xl">
                          {formatTime(elapsedTime)}
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-sm">Charging Speed</span>
                        </div>
                        <div className="text-2xl">
                          {chargingSpeed}{" "}
                          <span className="text-sm text-gray-600">kW</span>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {contextChargingState === "active" && (
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full"
                      onClick={handleStopCharging}
                      disabled={isStoppingCharging}
                    >
                      <StopCircle className="w-4 h-4 mr-2" />
                      {isStoppingCharging ? "Stopping..." : "Stop Charging"}
                    </Button>
                  )}
                  {timeRemaining !== null && timeRemaining < 10 && (
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="lg"
                      disabled={!canExtend || isCheckingExtension}
                    >
                      {isCheckingExtension
                        ? "Checking availability..."
                        : !canExtend
                        ? "Extension unavailable"
                        : `Add 10 minutes to Reservation (${timeRemaining} min left)`}
                    </Button>
                  )}

                  <p className="text-xs text-center text-gray-500">
                    You will be charged for the energy delivered up to this
                    point
                  </p>
                </>
              ) : (
                <>
                  <Card className="p-8 text-center items-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                      <Zap className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="mb-2">No Active Charging Session</h3>

                    <Button
                      className="w-full bg-green-100 hover:bg-green-700 border-1 border-green-500"
                      size="lg"
                      onClick={startCharging}
                    >
                      Start charging
                    </Button>
                  </Card>
                </>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Zap className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="mb-2">No Active Session</h3>
          <p className="text-gray-600 text-sm">Plan a journey to get started</p>
        </div>
      )}
    </div>
  );
}
