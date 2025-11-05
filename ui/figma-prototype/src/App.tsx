import { useState } from "react";
import { MapView } from "./components/MapView";
// import { StationList } from "./components/StationList";
import { StationDetail } from "./components/StationDetail";
import { ChargingSession } from "./components/ChargingSession";
import { UserProfile } from "./components/UserProfile";
import {
  JourneyPlanner,
  PlannedJourney,
} from "./components/JourneyPlanner";
import { RoutePreview } from "./components/RoutePreview";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./components/ui/tabs";
import { Toaster } from "./components/ui/sonner";
import { MapPin, List, Zap, User, Route } from "lucide-react";
import { toast } from "sonner";

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  prepTime: number; // in minutes
};

export type Restaurant = {
  id: string;
  name: string;
  cuisine: string[];
  // rating: number;
  prepTime: string;
  // priceRange: '$' | '$$' | '$$$';
  image: string;
  menu: MenuItem[];
};

export type ChargingStation = {
  id: string;
  name: string;
  address: string;
  distance: number;
  availableChargers: number;
  totalChargers: number;
  chargerTypes: ("Type 2" | "CCS" | "ChaDeMo")[];
  pricePerKwh: number;
  // amenities: string[];
  // rating: number;
  lat: number;
  lng: number;
  // network: string;
  restaurants: Restaurant[];
};

export type ChargingSessionType = {
  id: string;
  stationId: string;
  stationName: string;
  startTime: Date;
  endTime?: Date;
  energyDelivered: number;
  cost: number;
  status: "active" | "completed";
};

export type RestaurantOrder = {
  id: string;
  restaurantId: string;
  restaurantName: string;
  stationId: string;
  stationName: string;
  items: { menuItem: MenuItem; quantity: number }[];
  totalCost: number;
  status: "pending" | "cooking" | "ready" | "completed";
  orderTime: Date;
  pickupTime?: Date;
  isPaid: boolean;
};

export default function App() {
  const [selectedStation, setSelectedStation] =
    useState<ChargingStation | null>(null);
  const [activeSession, setActiveSession] =
    useState<ChargingSessionType | null>(null);
  const [favorites, setFavorites] = useState<string[]>([
    "1",
    "3",
  ]);
  const [currentTab, setCurrentTab] = useState("journey");
  const [restaurantOrders, setRestaurantOrders] = useState<
    RestaurantOrder[]
  >([]);
  const [plannedJourney, setPlannedJourney] =
    useState<PlannedJourney | null>(null);
  const [showRoutePreview, setShowRoutePreview] =
    useState(false);
  const [isJourneyActive, setIsJourneyActive] = useState(false);

  const stations: ChargingStation[] = [
    {
      id: "1",
      name: "Downtown Charging Hub",
      address: "123 Main St, Downtown",
      distance: 0.5,
      availableChargers: 4,
      totalChargers: 8,
      chargerTypes: ["CCS", "Type 2"],
      pricePerKwh: 0.35,
      // amenities: ['WiFi', 'Cafe', 'Restrooms'],
      // rating: 4.5,
      lat: 40.7589,
      lng: -73.9851,
      // network: 'ChargePoint',
      restaurants: [
        {
          id: "r1",
          name: "Green Leaf Bistro",
          cuisine: ["Vegetarian"],
          // rating: 4.6,
          prepTime: "15-20 min",
          // priceRange: '$$',
          image:
            "https://images.unsplash.com/photo-1555057949-7e4a30956f1f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
          menu: [
            {
              id: "m1",
              name: "Quinoa Power Bowl",
              description:
                "Mixed quinoa, roasted vegetables, avocado, tahini dressing",
              price: 12.99,
              category: "Bowls",
              prepTime: 15,
            },
            {
              id: "m2",
              name: "Green Goddess Smoothie",
              description:
                "Spinach, banana, mango, almond milk, chia seeds",
              price: 7.99,
              category: "Beverages",
              prepTime: 5,
            },
            {
              id: "m3",
              name: "Grilled Chicken Wrap",
              description:
                "Herb-marinated chicken, mixed greens, hummus, whole wheat wrap",
              price: 10.99,
              category: "Wraps",
              prepTime: 12,
            },
          ],
        },
        {
          id: "r2",
          name: "Urban Coffee House",
          cuisine: ["European"],
          // rating: 4.4,
          prepTime: "5-10 min",
          // priceRange: '$',
          image:
            "https://images.unsplash.com/photo-1628565350863-533a3c174b85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
          menu: [
            {
              id: "m4",
              name: "Cappuccino",
              description:
                "Double shot espresso with steamed milk",
              price: 4.5,
              category: "Coffee",
              prepTime: 5,
            },
            {
              id: "m5",
              name: "Croissant",
              description: "Freshly baked butter croissant",
              price: 3.99,
              category: "Pastries",
              prepTime: 2,
            },
            {
              id: "m6",
              name: "Avocado Toast",
              description:
                "Smashed avocado on sourdough, cherry tomatoes, feta",
              price: 8.99,
              category: "Breakfast",
              prepTime: 8,
            },
          ],
        },
      ],
    },
    {
      id: "2",
      name: "Mall Parking Lot",
      address: "456 Shopping Blvd",
      distance: 1.2,
      availableChargers: 2,
      totalChargers: 6,
      chargerTypes: ["CCS"],
      pricePerKwh: 0.28,
      // amenities: ["Shopping", "Food Court"],
      // rating: 4.2,
      lat: 40.7614,
      lng: -73.9776,
      // network: "EVgo",
      restaurants: [
        {
          id: "r3",
          name: "Burger Junction",
          cuisine: ["American"],
          // rating: 4.3,
          prepTime: "12-18 min",
          // priceRange: "$$",
          image:
            "https://images.unsplash.com/photo-1644447381290-85358ae625cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
          menu: [
            {
              id: "m7",
              name: "Classic Cheeseburger",
              description:
                "Angus beef patty, cheddar, lettuce, tomato, special sauce",
              price: 11.99,
              category: "Burgers",
              prepTime: 15,
            },
            {
              id: "m8",
              name: "Sweet Potato Fries",
              description:
                "Crispy sweet potato fries with chipotle mayo",
              price: 5.99,
              category: "Sides",
              prepTime: 10,
            },
          ],
        },
      ],
    },
    {
      id: "3",
      name: "Tesla Supercharger Station",
      address: "789 Highway 101",
      distance: 2.1,
      availableChargers: 8,
      totalChargers: 12,
      chargerTypes: ["ChaDeMo", "Type 2"],
      pricePerKwh: 0.42,
      // amenities: ["Convenience Store", "Restrooms"],
      // rating: 4.8,
      lat: 40.7489,
      lng: -73.968,
      // network: "Tesla",
      restaurants: [
        {
          id: "r4",
          name: "Highway Grill",
          cuisine: ["American"],
          // rating: 4.5,
          prepTime: "15-25 min",
          // priceRange: "$$",
          image:
            "https://images.unsplash.com/photo-1710533820700-dd6f6623cc97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
          menu: [
            {
              id: "m9",
              name: "Club Sandwich",
              description:
                "Triple-decker with turkey, bacon, lettuce, tomato",
              price: 13.99,
              category: "Sandwiches",
              prepTime: 15,
            },
            {
              id: "m10",
              name: "Caesar Salad",
              description:
                "Romaine, parmesan, croutons, Caesar dressing",
              price: 9.99,
              category: "Salads",
              prepTime: 10,
            },
            {
              id: "m11",
              name: "Chocolate Milkshake",
              description:
                "Rich chocolate ice cream blended to perfection",
              price: 6.99,
              category: "Beverages",
              prepTime: 5,
            },
          ],
        },
        {
          id: "r5",
          name: "Slice of Italy",
          cuisine: ["Italian"],
          // rating: 4.7,
          prepTime: "10-15 min",
          // priceRange: "$",
          image:
            "https://images.unsplash.com/photo-1563245738-9169ff58eccf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
          menu: [
            {
              id: "m12",
              name: "Margherita Pizza Slice",
              description:
                "Fresh mozzarella, basil, San Marzano tomatoes",
              price: 4.99,
              category: "Pizza",
              prepTime: 8,
            },
            {
              id: "m13",
              name: "Garlic Knots",
              description:
                "Warm garlic knots with marinara sauce",
              price: 5.99,
              category: "Appetizers",
              prepTime: 10,
            },
          ],
        },
      ],
    },
    {
      id: "4",
      name: "City Center Garage",
      address: "321 Urban Ave",
      distance: 0.8,
      availableChargers: 0,
      totalChargers: 4,
      chargerTypes: ["Type 2", "CCS"],
      pricePerKwh: 0.38,
      // amenities: ["Covered Parking"],
      // rating: 4.0,
      lat: 40.7556,
      lng: -73.9922,
      // network: "ChargePoint",
      restaurants: [
        {
          id: "r6",
          name: "Sushi Express",
          cuisine: ["Asian"],
          // rating: 4.4,
          prepTime: "10-15 min",
          // priceRange: "$$",
          image:
            "https://images.unsplash.com/photo-1600470944938-b301e41001c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
          menu: [
            {
              id: "m14",
              name: "California Roll",
              description: "Crab, avocado, cucumber",
              price: 8.99,
              category: "Rolls",
              prepTime: 10,
            },
            {
              id: "m15",
              name: "Spicy Tuna Roll",
              description: "Fresh tuna, spicy mayo, cucumber",
              price: 9.99,
              category: "Rolls",
              prepTime: 10,
            },
            {
              id: "m16",
              name: "Miso Soup",
              description:
                "Traditional Japanese soup with tofu and seaweed",
              price: 3.99,
              category: "Appetizers",
              prepTime: 5,
            },
          ],
        },
      ],
    },
    {
      id: "5",
      name: "Airport Charging",
      address: "555 Airport Rd",
      distance: 5.4,
      availableChargers: 6,
      totalChargers: 10,
      chargerTypes: ["CCS", "Type 2"],
      pricePerKwh: 0.45,
      // amenities: ["Airport Access", "WiFi"],
      // rating: 4.3,
      lat: 40.77,
      lng: -73.95,
      // network: "EVgo",
      restaurants: [
        {
          id: "r7",
          name: "Airport Cafe",
          cuisine: ["European"],
          // rating: 4.1,
          prepTime: "15-20 min",
          // priceRange: "$$$",
          image:
            "https://images.unsplash.com/photo-1753377773393-000264c2a010?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
          menu: [
            {
              id: "m17",
              name: "Breakfast Burrito",
              description:
                "Scrambled eggs, bacon, cheese, salsa, tortilla",
              price: 10.99,
              category: "Breakfast",
              prepTime: 12,
            },
            {
              id: "m18",
              name: "Greek Yogurt Parfait",
              description:
                "Greek yogurt, granola, fresh berries, honey",
              price: 7.99,
              category: "Breakfast",
              prepTime: 5,
            },
          ],
        },
      ],
    },
  ];

  // const toggleFavorite = (stationId: string) => {
  //   setFavorites((prev) =>
  //     prev.includes(stationId)
  //       ? prev.filter((id) => id !== stationId)
  //       : [...prev, stationId],
  //   );
  // };

  const startChargingSession = (station: ChargingStation) => {
    const newSession: ChargingSessionType = {
      id: Date.now().toString(),
      stationId: station.id,
      stationName: station.name,
      startTime: new Date(),
      energyDelivered: 0,
      cost: 0,
      status: "active",
    };
    setActiveSession(newSession);
    setCurrentTab("session");
    toast.success(`Started charging at ${station.name}`);
  };

  const endChargingSession = () => {
    if (activeSession) {
      setActiveSession({
        ...activeSession,
        endTime: new Date(),
        status: "completed",
      });
      toast.success("Charging session completed!");
    }
  };

  const placeRestaurantOrder = (order: RestaurantOrder) => {
    setRestaurantOrders((prev) => [...prev, order]);
  };

  const updateOrderStatus = (
    orderId: string,
    status: RestaurantOrder["status"],
  ) => {
    setRestaurantOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status } : order,
      ),
    );
  };

  const handlePlanJourney = (journey: PlannedJourney) => {
    setPlannedJourney(journey);
    toast.success("Journey planned successfully!");
  };

  const handleViewRoute = (journey: PlannedJourney) => {
    setShowRoutePreview(true);
  };

  const handleStartJourney = () => {
    setIsJourneyActive(true);
    setShowRoutePreview(false);
    setCurrentTab("session");
    toast.success("Journey started! Drive safely.");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <h1>Hello World</h1>
      <Toaster />
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-green-600" />
              <h1 className="text-green-600">Feast Faster</h1>
            </div>
            {isJourneyActive && plannedJourney && (
              <div className="flex items-center gap-2 text-sm">
                <Route className="w-4 h-4 text-green-600" />
                <span className="text-gray-600">
                  Journey in progress
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="pb-20">
        {showRoutePreview && plannedJourney ? (
          <RoutePreview
            journey={plannedJourney}
            onStartJourney={handleStartJourney}
            onPlaceOrder={placeRestaurantOrder}
            onBack={() => setShowRoutePreview(false)}
          />
        ) : (
          <Tabs
            value={currentTab}
            onValueChange={setCurrentTab}
            className="w-full"
          >
            <TabsContent value="journey" className="m-0">
              <JourneyPlanner
                stations={stations}
                onPlanJourney={handlePlanJourney}
                onViewRoute={handleViewRoute}
              />
            </TabsContent>

            {/* <TabsContent value="map" className="m-0">
              <MapView
                stations={stations}
                selectedStation={selectedStation}
                onSelectStation={setSelectedStation}
                favorites={favorites}
              />
            </TabsContent> */}

            {/* <TabsContent value="list" className="m-0">
              <StationList
                stations={stations}
                onSelectStation={setSelectedStation}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
              />
            </TabsContent> */}

            <TabsContent value="session" className="m-0">
              <ChargingSession
                activeSession={activeSession}
                onEndSession={endChargingSession}
                restaurantOrders={restaurantOrders}
                onUpdateOrderStatus={updateOrderStatus}
                isJourneyActive={isJourneyActive}
                plannedJourney={plannedJourney}
                onStartCharging={startChargingSession} // New addition
              />
            </TabsContent>

            <TabsContent value="profile" className="m-0">
              <UserProfile
                restaurantOrders={restaurantOrders}
              />
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Bottom Navigation */}
      {!showRoutePreview && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
          <Tabs
            value={currentTab}
            onValueChange={setCurrentTab}
            className="w-full"
          >
            <TabsList className="w-full h-16 grid grid-cols-3 rounded-none bg-white">
              <TabsTrigger
                value="journey"
                className="flex flex-col gap-1 data-[state=active]:text-green-600 relative"
              >
                <Route className="w-5 h-5" />
                <span className="text-xs">Journey</span>
                {isJourneyActive && (
                  <span className="absolute top-2 right-3 w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                )}
              </TabsTrigger>
              {/* <TabsTrigger
                value="map"
                className="flex flex-col gap-1 data-[state=active]:text-green-600"
              >
                <MapPin className="w-5 h-5" />
                <span className="text-xs">Map</span>
              </TabsTrigger> */}
              {/* <TabsTrigger
                value="list"
                className="flex flex-col gap-1 data-[state=active]:text-green-600"
              >
                <List className="w-5 h-5" />
                <span className="text-xs">Stations</span>
              </TabsTrigger> */}
              <TabsTrigger
                value="session"
                className="flex flex-col gap-1 data-[state=active]:text-green-600 relative"
              >
                <Zap className="w-5 h-5" />
                <span className="text-xs">Active</span>
                {(activeSession?.status === "active" ||
                  restaurantOrders.some((o) =>
                    ["pending", "preparing", "ready"].includes(
                      o.status,
                    ),
                  )) && (
                  <span className="absolute top-2 right-3 w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="flex flex-col gap-1 data-[state=active]:text-green-600"
              >
                <User className="w-5 h-5" />
                <span className="text-xs">Settings</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </nav>
      )}

      {/* Station Detail Modal */}
      {/* {selectedStation && !showRoutePreview && (
        <StationDetail
          station={selectedStation}
          onClose={() => setSelectedStation(null)}
          onStartCharging={startChargingSession}
          isFavorite={favorites.includes(selectedStation.id)}
          {onToggleFavorite={() =>
            toggleFavorite(selectedStation.id)
          }}
          hasActiveSession={!!activeSession}
          onPlaceOrder={placeRestaurantOrder}
        />
      )} */}
    </div>
  );
}