import { RestaurantOrder } from "../App";
import { PlannedJourney } from "./JourneyPlanner";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Slider } from "./ui/slider";
import {
  User,
  CreditCard,
  Car,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Zap,
  MapPin,
  DollarSign,
  Award,
  UtensilsCrossed,
  Receipt,
  Route,
  Navigation,
} from "lucide-react";

type UserProfileProps = {
  restaurantOrders: RestaurantOrder[];
  pastJourneys?: PlannedJourney[];
};

export function UserProfile({
  restaurantOrders,
  pastJourneys = [],
}: UserProfileProps) {
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    memberSince: "January 2024",
    membershipTier: "Premium",
  };

  const vehicle = {
    make: "Tesla",
    model: "Model 3",
    year: 2023,
    batteryCapacity: 75,
  };

  const paymentMethods = [
    { id: "1", type: "Visa", last4: "4242", isDefault: true },
    {
      id: "2",
      type: "Mastercard",
      last4: "5555",
      isDefault: false,
    },
  ];

  const stats = {
    totalSessions: 47,
    totalEnergy: 1234.5,
    totalSpent: 432.18,
    co2Saved: 892,
    totalJourneys: pastJourneys.length + 12, // Add some mock journeys
    totalMiles:
      pastJourneys.reduce(
        (sum, j) => sum + j.totalDistance,
        0,
      ) + 3420,
  };

  return (
    <div className="min-h-[calc(100vh-120px)] bg-gray-50 pb-4">
      {/* Profile Header */}
      <Card className="m-4 p-6">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="bg-green-600 text-white text-xl">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="mb-1">{user.name}</h2>
            <p className="text-sm text-gray-600">
              {user.email}
            </p>
            {/* <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-green-600">{user.membershipTier}</Badge>
              <span className="text-xs text-gray-600">
                Member since {user.memberSince}
              </span>
            </div> */}
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="mx-4 mb-4">
        {/* <h3 className="mb-3 px-1">Your Statistics</h3> */}
        <div className="grid grid-cols-2 gap-3">
          {/* <Card className="p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Route className="w-4 h-4" />
              <span className="text-sm">Journeys</span>
            </div>
            <div className="text-2xl">
              {stats.totalJourneys}
            </div>
          </Card> */}
          {/* <Card className="p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Navigation className="w-4 h-4" />
              <span className="text-sm">Miles Driven</span>
            </div>
            <div className="text-2xl">
              {stats.totalMiles.toLocaleString()}
            </div>
          </Card> */}
          {/* <Card className="p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-sm">Charge Sessions</span>
            </div>
            <div className="text-2xl">
              {stats.totalSessions}
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Award className="w-4 h-4" />
              <span className="text-sm">CO₂ Saved</span>
            </div>
            <div className="text-xl">{stats.co2Saved} kg</div>
          </Card> */}
        </div>
      </div>

      {/* Vehicle Info */}
      <Card className="mx-4 mb-4 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-gray-600" />
            <h3>Your Vehicle</h3>
          </div>
          {/* <Button variant="ghost" size="sm">
            Edit
          </Button> */}
        </div>
        <div className="space-y-2">
          {/* <div className="flex justify-between">
            <span className="text-gray-600">Model</span>
            <span>
              {vehicle.year} {vehicle.make} {vehicle.model}
            </span>
          </div> */}
          <div className="space-y-2">
            <Label className="text-sm">EV Model</Label>
            <Select value={"evmodel"}>
              <SelectTrigger>
                <SelectValue placeholder="Your EV model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Select</SelectItem>
                <SelectItem value="Skoda">
                  Skoda ...{" "}
                </SelectItem>
                <SelectItem value="VW">
                  Volkswagen ...
                </SelectItem>
                <SelectItem value="Audi">Audi ...</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* <div className="flex justify-between">
            <span className="text-gray-600">
              Battery Capacity
            </span>
            <span>{vehicle.batteryCapacity} kWh</span>
          </div> */}
          {/* Desired SOC - this doesn't work */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm">
                Desired Charge Level at Stops
              </Label>
              <span className="text-sm text-green-600">
                80%
              </span>
            </div>
            {/* <Slider
              value={80}
              onValueChange={() => console.log()}
              min={50}
              max={100}
              step={5}
              className="w-full"
            /> */}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Connector Type</Label>
            <Select value={"connectorType"}>
              <SelectTrigger>
                <SelectValue placeholder="Select connector type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">
                  Connector type
                </SelectItem>
                <SelectItem value="Type 2">Type 2</SelectItem>
                <SelectItem value="CCS">CCS</SelectItem>
                <SelectItem value="ChaDeMo">ChaDeMo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="mx-4 mb-4 p-4">
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-gray-600" />
            <h3>Your preferences</h3>
          </div>
          <div className="space-y-4">
            <Label className="text-sm">
              Cuisine Preference
            </Label>
            <Select
              value={""}
              onValueChange={() => console.log()}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select cuisine" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Cuisine</SelectItem>
                <SelectItem value="american">
                  American
                </SelectItem>
                <SelectItem value="asian">Asian</SelectItem>
                <SelectItem value="healthy">
                  Vegetarian
                </SelectItem>
                <SelectItem value="italian">Italian</SelectItem>
                <SelectItem value="japanese">
                  Japanese
                </SelectItem>
                <SelectItem value="coffee">
                  Coffee & Pastries
                </SelectItem>
                <SelectItem value="international">
                  International
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Payment Methods */}
      <Card className="mx-4 mb-4 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gray-600" />
            <h3>Payment Methods</h3>
          </div>
          <Button variant="ghost" size="sm">
            Add
          </Button>
        </div>
        <div className="space-y-2">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="flex items-center gap-2">
                    <span>{method.type}</span>
                    {method.isDefault && (
                      <Badge
                        variant="outline"
                        className="text-xs"
                      >
                        Default
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-gray-600">
                    •••• {method.last4}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          ))}
        </div>
      </Card>

      {/* Restaurant Order History */}
      {/* {restaurantOrders.filter((o) => o.status === "completed")
        .length > 0 && (
        <Card className="mx-4 mb-4">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Receipt className="w-5 h-5 text-gray-600" />
              <h3>Recent Food Orders</h3>
              <Badge variant="outline">
                {
                  restaurantOrders.filter(
                    (o) => o.status === "completed",
                  ).length
                }
              </Badge>
            </div>
          </div>
          <Separator />
          <div className="max-h-64 overflow-y-auto">
            {restaurantOrders
              .filter((o) => o.status === "completed")
              .slice(0, 5)
              .map((order) => (
                <div key={order.id}>
                  <div className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <UtensilsCrossed className="w-4 h-4 text-gray-600" />
                          <span>{order.restaurantName}</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {order.stationName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {order.orderTime.toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <div>${order.totalCost.toFixed(2)}</div>
                        <Badge
                          variant="outline"
                          className="mt-1 text-xs"
                        >
                          {order.items.reduce(
                            (sum, item) => sum + item.quantity,
                            0,
                          )}{" "}
                          items
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Separator />
                </div>
              ))}
          </div>
        </Card>
      )} */}

      {/* Settings */}
      {/* <Card className="mx-4 mb-4">
        <div className="p-4">
          <h3 className="mb-3">Settings</h3>
        </div>
        <Separator />

        <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-gray-600" />
            <span>Notifications</span>
          </div>
          <Switch defaultChecked />
        </button>

        <Separator />

        <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-gray-600" />
            <span>Location Services</span>
          </div>
          <Switch defaultChecked />
        </button>

        <Separator />

        <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-gray-600" />
            <span>Auto-Start Charging</span>
          </div>
          <Switch />
        </button>
      </Card> */}

      {/* Menu Items */}
      {/* <Card className="mx-4 mb-4">
        <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-600" />
            <span>Account Settings</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <Separator />

        <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-gray-600" />
            <span>Preferences</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <Separator />

        <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-gray-600" />
            <span>Help & Support</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </Card> */}

      {/* Logout Button */}
      <div className="mx-4">
        <Button variant="outline" className="w-full" size="lg">
          <LogOut className="w-5 h-5 mr-2" />
          Log Out
        </Button>
      </div>
      {/* 
      <p className="text-center text-xs text-gray-500 mt-6">
        ChargeHub v1.0.0
      </p> */}
    </div>
  );
}