import { RestaurantOrder } from "@/pages/home";
import { PlannedJourney } from "@/pages/home";
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
  onLogout: () => void;
};

export function UserProfile({
  restaurantOrders,
  pastJourneys = [],
  onLogout,
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
    totalJourneys: pastJourneys.length + 12,
    totalMiles:
      pastJourneys.reduce(
        (sum, j) => sum + j.totalDistance,
        0,
      ) + 3420,
  };

  return (
    <div className="min-h-[calc(100vh-120px)] bg-gray-50 pb-4">
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
          </div>
        </div>
      </Card>

      <div className="mx-4 mb-4">
        <div className="grid grid-cols-2 gap-3">
        </div>
      </div>

      <Card className="mx-4 mb-4 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-gray-600" />
            <h3>Your Vehicle</h3>
          </div>
        </div>
        <div className="space-y-2">
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
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm">
                Desired Charge Level at Stops
              </Label>
              <span className="text-sm text-green-600">
                80%
              </span>
            </div>
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

      <div className="mx-4">
        <Button onClick={onLogout} variant="outline" className="w-full" size="lg">
          <LogOut className="w-5 h-5 mr-2" />
          Log Out
        </Button>
      </div>
    </div>
  );
}
