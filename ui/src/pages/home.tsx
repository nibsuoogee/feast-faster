import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ChargingSession } from "@/components/ChargingSession";
import { UserProfile } from "@/components/UserProfile";
import { RoutePreview } from "@/components/RoutePreview";
import { CuisineMultiSelect } from "@/components/CuisinesMultiSelect";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { FC } from "react";
import { Route as RouteIcon, Zap, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Navigation,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Battery,
  UtensilsCrossed,
} from "lucide-react";
import { getFilteredStations } from "@/services/stations";
import { useUserLocation } from "@/services/geocode";

const Toaster: FC<{ position?: string }> = () => null;
const toast = {
  error: (msg: string) => {
    if (typeof window !== "undefined") {
      console.error(msg);
      try { alert(msg); } catch {}
    } else {
      console.error(msg);
    }
  },
};

// Types
export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  prepTime: number;
};

export type Restaurant = {
  id: number;
  name: string;
  cuisine: string[];
  prepTime: string;
  image: string;
  menu: MenuItem[];
};

export type ChargingStation = {
  id: number;
  name: string;
  address: string;
  distance: number;
  travelTimeMin: number;
  availableChargers: number;
  totalChargers: number;
  chargerTypes: ("Type 2" | "CCS" | "ChaDeMo")[];
  pricePerKwh: number; // Todo
  lat: number; // Todo do we need it?
  lng: number; // Todo do we need it?
  restaurants: Restaurant[];
  socAtArrival: number; // Do we need it here?
  //chargers: t.Array(chargerModel), // Use this or charger number?
  estimateChargingTimeMin: number
};

export type JourneyStop = { // Do we need Journey stop at all?
  station: ChargingStation;
  estimatedArrivalTime: Date; // Todo Now + travelTimeMin: check
  socAtArrival: number; // Do we need it here?
  chargingDuration: number; // estimateChargingTimeMin: number; // Do we need it?
  distanceFromStart: number;
  selectedRestaurantId?: number; // Do we need it?
  isSelected: boolean; // Todo: Check how station selection works when ordering 
};

export type PlannedJourney = {
  id: string;
  startLocation: string;
  endLocation: string;
  totalDistance: number;
  estimatedDuration: number;
  stops: JourneyStop[];
  createdAt: Date;
};

export type ChargingSessionType = {
  id: string;
  stationId: number;
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

export const Home = () => {
  const { logout } = useAuth();
  const [currentTab, setCurrentTab] = useState("journey");
  const [activeSession, setActiveSession] = useState<ChargingSessionType | null>(null);
  const [restaurantOrders, setRestaurantOrders] = useState<RestaurantOrder[]>([]);
  const [plannedJourney, setPlannedJourney] = useState<PlannedJourney | null>(null);
  const [showRoutePreview, setShowRoutePreview] = useState(false);
  const [isJourneyActive, setIsJourneyActive] = useState(false);

  // Journey Planner state
  const [currentSOC, setCurrentSOC] = useState([75]);
  const [currentRange, setCurrentRange] = useState([180]);
  const [desiredSOC, setDesiredSOC] = useState([80]);
  const [, setDemoStations] = useState<any[] | null>(null);
  const [connectorType, setConnectorType] = useState<string>("any");
  const [cuisinePreference, setCuisinePreference] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [endLocation, setEndLocation] = useState("");
  const [isPlanning, setIsPlanning] = useState(false);

  // Current user location
  const currentUserLocation = useUserLocation();

  // // Mock charging stations data
  // const stations: ChargingStation[] = [
  //   {
  //     id: "1",
  //     name: "Downtown Charging Hub",
  //     address: "123 Main St, Lahti",
  //     distance: 5.2,
  //     availableChargers: 4,
  //     totalChargers: 8,
  //     chargerTypes: ["CCS", "Type 2"],
  //     pricePerKwh: 0.35,
  //     lat: 60.9827,
  //     lng: 25.6612,
  //     restaurants: [
  //       {
  //         id: "r1",
  //         name: "Green Leaf Bistro",
  //         cuisine: ["Vegetarian"],
  //         prepTime: "15-20 min",
  //         image: "https://images.unsplash.com/photo-1555057949-7e4a30956f1f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  //         menu: [
  //           {
  //             id: "m1",
  //             name: "Quinoa Power Bowl",
  //             description: "Mixed quinoa, roasted vegetables, avocado, tahini dressing",
  //             price: 12.99,
  //             category: "Bowls",
  //             prepTime: 15,
  //           },
  //           {
  //             id: "m2",
  //             name: "Green Goddess Smoothie",
  //             description: "Spinach, banana, mango, almond milk, chia seeds",
  //             price: 7.99,
  //             category: "Beverages",
  //             prepTime: 5,
  //           },
  //           {
  //             id: "m3",
  //             name: "Grilled Chicken Wrap",
  //             description: "Herb-marinated chicken, mixed greens, hummus, whole wheat wrap",
  //             price: 10.99,
  //             category: "Wraps",
  //             prepTime: 12,
  //           },
  //           {
  //             id: "m201",
  //             name: "Mediterranean Salad",
  //             description: "Fresh tomatoes, cucumber, olives, feta cheese, olive oil",
  //             price: 9.99,
  //             category: "Salads",
  //             prepTime: 10,
  //           },
  //         ],
  //       },
  //       {
  //         id: "r2",
  //         name: "Urban Coffee House",
  //         cuisine: ["European"],
  //         prepTime: "5-10 min",
  //         image: "https://images.unsplash.com/photo-1628565350863-533a3c174b85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  //         menu: [
  //           {
  //             id: "m4",
  //             name: "Cappuccino",
  //             description: "Double shot espresso with steamed milk",
  //             price: 4.5,
  //             category: "Coffee",
  //             prepTime: 5,
  //           },
  //           {
  //             id: "m5",
  //             name: "Croissant",
  //             description: "Freshly baked butter croissant",
  //             price: 3.99,
  //             category: "Pastries",
  //             prepTime: 2,
  //           },
  //           {
  //             id: "m6",
  //             name: "Avocado Toast",
  //             description: "Smashed avocado on sourdough, cherry tomatoes, feta",
  //             price: 8.99,
  //             category: "Breakfast",
  //             prepTime: 8,
  //           },
  //           {
  //             id: "m202",
  //             name: "Latte",
  //             description: "Espresso with steamed milk and foam",
  //             price: 4.99,
  //             category: "Coffee",
  //             prepTime: 5,
  //           },
  //           {
  //             id: "m203",
  //             name: "Chocolate Muffin",
  //             description: "Rich chocolate muffin with chocolate chips",
  //             price: 4.50,
  //             category: "Pastries",
  //             prepTime: 2,
  //           },
  //         ],
  //       },
  //     ],
  //   },
  //   {
  //     id: "2",
  //     name: "Highway Service Station",
  //     address: "E75 Highway, 45km marker",
  //     distance: 45.0,
  //     availableChargers: 6,
  //     totalChargers: 10,
  //     chargerTypes: ["CCS", "ChaDeMo"],
  //     pricePerKwh: 0.42,
  //     lat: 61.2827,
  //     lng: 25.8612,
  //     restaurants: [
  //       {
  //         id: "r3",
  //         name: "Burger Junction",
  //         cuisine: ["American"],
  //         prepTime: "12-18 min",
  //         image: "https://images.unsplash.com/photo-1644447381290-85358ae625cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  //         menu: [
  //           {
  //             id: "m7",
  //             name: "Classic Cheeseburger",
  //             description: "Angus beef patty, cheddar, lettuce, tomato, special sauce",
  //             price: 11.99,
  //             category: "Burgers",
  //             prepTime: 15,
  //           },
  //           {
  //             id: "m8",
  //             name: "Sweet Potato Fries",
  //             description: "Crispy sweet potato fries with chipotle mayo",
  //             price: 5.99,
  //             category: "Sides",
  //             prepTime: 10,
  //           },
  //           {
  //             id: "m204",
  //             name: "BBQ Bacon Burger",
  //             description: "Double beef patty, bacon, BBQ sauce, onion rings",
  //             price: 13.99,
  //             category: "Burgers",
  //             prepTime: 18,
  //           },
  //           {
  //             id: "m205",
  //             name: "Chicken Wings",
  //             description: "8 pieces with choice of sauce",
  //             price: 9.99,
  //             category: "Appetizers",
  //             prepTime: 12,
  //           },
  //           {
  //             id: "m206",
  //             name: "Milkshake",
  //             description: "Vanilla, chocolate, or strawberry",
  //             price: 5.50,
  //             category: "Beverages",
  //             prepTime: 5,
  //           },
  //         ],
  //       },
  //       {
  //         id: "r4",
  //         name: "Pizza Express",
  //         cuisine: ["Italian"],
  //         prepTime: "10-15 min",
  //         image: "https://images.unsplash.com/photo-1563245738-9169ff58eccf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  //         menu: [
  //           {
  //             id: "m9",
  //             name: "Margherita Pizza Slice",
  //             description: "Fresh mozzarella, basil, San Marzano tomatoes",
  //             price: 4.99,
  //             category: "Pizza",
  //             prepTime: 8,
  //           },
  //           {
  //             id: "m10",
  //             name: "Pepperoni Pizza Slice",
  //             description: "Classic pepperoni with mozzarella",
  //             price: 5.99,
  //             category: "Pizza",
  //             prepTime: 8,
  //           },
  //           {
  //             id: "m11",
  //             name: "Garlic Knots",
  //             description: "Warm garlic knots with marinara sauce",
  //             price: 5.99,
  //             category: "Appetizers",
  //             prepTime: 10,
  //           },
  //         ],
  //       },
  //     ],
  //   },
  //   {
  //     id: "3",
  //     name: "Tesla Supercharger Hämeenlinna",
  //     address: "Parolantie 52, Hämeenlinna",
  //     distance: 70.5,
  //     availableChargers: 8,
  //     totalChargers: 12,
  //     chargerTypes: ["CCS", "Type 2"],
  //     pricePerKwh: 0.38,
  //     lat: 60.9959,
  //     lng: 24.4608,
  //     restaurants: [
  //       {
  //         id: "r5",
  //         name: "Sushi Express",
  //         cuisine: ["Asian"],
  //         prepTime: "10-15 min",
  //         image: "https://images.unsplash.com/photo-1600470944938-b301e41001c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  //         menu: [
  //           {
  //             id: "m12",
  //             name: "California Roll",
  //             description: "Crab, avocado, cucumber",
  //             price: 8.99,
  //             category: "Rolls",
  //             prepTime: 10,
  //           },
  //           {
  //             id: "m13",
  //             name: "Spicy Tuna Roll",
  //             description: "Fresh tuna, spicy mayo, cucumber",
  //             price: 9.99,
  //             category: "Rolls",
  //             prepTime: 10,
  //           },
  //           {
  //             id: "m14",
  //             name: "Miso Soup",
  //             description: "Traditional Japanese soup with tofu and seaweed",
  //             price: 3.99,
  //             category: "Appetizers",
  //             prepTime: 5,
  //           },
  //           {
  //             id: "m207",
  //             name: "Salmon Nigiri",
  //             description: "Fresh salmon on seasoned rice (2 pieces)",
  //             price: 6.99,
  //             category: "Nigiri",
  //             prepTime: 8,
  //           },
  //           {
  //             id: "m208",
  //             name: "Edamame",
  //             description: "Steamed soybeans with sea salt",
  //             price: 4.99,
  //             category: "Appetizers",
  //             prepTime: 5,
  //           },
  //         ],
  //       },
  //       {
  //         id: "r6",
  //         name: "Thai Kitchen",
  //         cuisine: ["Asian"],
  //         prepTime: "15-20 min",
  //         image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  //         menu: [
  //           {
  //             id: "m15",
  //             name: "Pad Thai",
  //             description: "Stir-fried rice noodles with shrimp, peanuts, lime",
  //             price: 12.99,
  //             category: "Noodles",
  //             prepTime: 15,
  //           },
  //           {
  //             id: "m16",
  //             name: "Green Curry",
  //             description: "Coconut green curry with vegetables and chicken",
  //             price: 11.99,
  //             category: "Curry",
  //             prepTime: 18,
  //           },
  //           {
  //             id: "m209",
  //             name: "Tom Yum Soup",
  //             description: "Spicy and sour Thai soup with shrimp",
  //             price: 8.99,
  //             category: "Soups",
  //             prepTime: 12,
  //           },
  //         ],
  //       },
  //     ],
  //   },
  //   {
  //     id: "4",
  //     name: "ABC Charging Point",
  //     address: "Keskuskatu 15, Tampere",
  //     distance: 130.0,
  //     availableChargers: 3,
  //     totalChargers: 6,
  //     chargerTypes: ["Type 2", "CCS"],
  //     pricePerKwh: 0.40,
  //     lat: 61.4978,
  //     lng: 23.7610,
  //     restaurants: [
  //       {
  //         id: "r7",
  //         name: "Nordic Grill",
  //         cuisine: ["European"],
  //         prepTime: "15-25 min",
  //         image: "https://images.unsplash.com/photo-1710533820700-dd6f6623cc97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  //         menu: [
  //           {
  //             id: "m17",
  //             name: "Grilled Salmon",
  //             description: "Fresh salmon with dill sauce and vegetables",
  //             price: 16.99,
  //             category: "Main Course",
  //             prepTime: 20,
  //           },
  //           {
  //             id: "m18",
  //             name: "Caesar Salad",
  //             description: "Romaine, parmesan, croutons, Caesar dressing",
  //             price: 9.99,
  //             category: "Salads",
  //             prepTime: 10,
  //           },
  //           {
  //             id: "m19",
  //             name: "Mushroom Soup",
  //             description: "Creamy forest mushroom soup with bread",
  //             price: 7.99,
  //             category: "Soups",
  //             prepTime: 8,
  //           },
  //           {
  //             id: "m210",
  //             name: "Reindeer Steak",
  //             description: "Traditional Finnish reindeer with mashed potatoes",
  //             price: 18.99,
  //             category: "Main Course",
  //             prepTime: 25,
  //           },
  //         ],
  //       },
  //       {
  //         id: "r8",
  //         name: "Coffee & Pastries",
  //         cuisine: ["European"],
  //         prepTime: "5-10 min",
  //         image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  //         menu: [
  //           {
  //             id: "m20",
  //             name: "Cinnamon Bun",
  //             description: "Traditional Finnish korvapuusti",
  //             price: 3.50,
  //             category: "Pastries",
  //             prepTime: 2,
  //           },
  //           {
  //             id: "m21",
  //             name: "Espresso",
  //             description: "Strong Italian espresso",
  //             price: 2.99,
  //             category: "Coffee",
  //             prepTime: 3,
  //           },
  //           {
  //             id: "m211",
  //             name: "Blueberry Pie",
  //             description: "Fresh Finnish blueberry pie slice",
  //             price: 4.99,
  //             category: "Pastries",
  //             prepTime: 5,
  //           },
  //         ],
  //       },
  //     ],
  //   },
  // ];

  const handlePlanRoute = async () => {
    if (!endLocation) return;

    console.log("Planning route to:", endLocation);
    // console.log("Filters:", { connectorType, cuisinePreference, currentSOC, currentRange, desiredSOC });

    setIsPlanning(true);

    // If demoStations (API results) exist, use them; otherwise try to fetch the API now
    // Todo Why do we need source stations? We have demoStations useState
    // let sourceStations: any[] = [];
    // if (demoStations && demoStations.length > 0) {
    //   sourceStations = demoStations;
    // }

    // For API restaurants we don't have menus in the response.
    // Instead of attempting to match, attach a small static menu here so the UI can show orders.
    const staticMenuForApiRestaurant = (apiR: any): MenuItem[] => {
      const base = String(apiR?.name || "Restaurant").replace(/[^a-z0-9]/gi, "").toLowerCase();
      return [
        { id: `${base}-m1`, name: "Chef's Special", description: "House specialty with seasonal ingredients", price: 12.99, category: "Mains", prepTime: 15 },
        { id: `${base}-m2`, name: "Quick Snack", description: "Light bite for the road", price: 6.5, category: "Snacks", prepTime: 5 },
        { id: `${base}-m3`, name: "Coffee", description: "Freshly brewed coffee", price: 3.5, category: "Beverages", prepTime: 3 },
      ];
    };

    // Map API station shape to our local ChargingStation type
    const mapApiStationToChargingStation = (s: any): ChargingStation => {
      const chargers = Array.isArray(s.chargers) ? s.chargers : [];
      const chargerTypes = Array.from(new Set(chargers.map((c: any) => {
        if (!c || !c.type) return "Type 2";
        const t = String(c.type).toLowerCase();
        if (t.includes("chademo")) return "ChaDeMo" as any;
        if (t.includes("ccs")) return "CCS" as any;
        return c.type;
      })));

      const availableChargers = chargers.filter((c: any) => c.status === "available").length;
      const totalChargers = chargers.length;

      const restaurants = Array.isArray(s.restaurants) ? s.restaurants.map((r: any) => ({
        id: r.restaurant_id,
        name: r.name,
        cuisine: r.cuisines,
        prepTime: (s.estimate_charging_time_min ? `${s.estimate_charging_time_min} min` : "15-25 min"), // todo just mock ?
        image: r.image || "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=400&q=80",
        menu: staticMenuForApiRestaurant(r), // attach small static menu so ordering UI works
      })) : [];

      return {
        id: s.station_id,
        name: s.name,
        address: s.address,
        distance: s.distance_km,
        availableChargers,
        totalChargers,
        chargerTypes: chargerTypes as any,
        pricePerKwh: typeof s.price_per_kwh === "number" ? s.price_per_kwh : 0.4, // Todo What to do about it?
        lat: typeof s.lat === "number" ? s.lat : 0, // Todo Do we need it?
        lng: typeof s.lng === "number" ? s.lng : 0, // Todo Do we need it?
        restaurants,
        travelTimeMin: s.travel_time_min, // Todo format
        socAtArrival: s.soc_at_arrival,
        estimateChargingTimeMin: s.estimate_charging_time_min
      };
    };

    // Todo endLocation convert from address to lon, lat

    try {
      let stations: any[] = [];
      //if (sourceStations.length === 0) {
      try {
        const body = {
          current_location: [currentUserLocation.longitude, currentUserLocation.latitude] as [number, number],
          destination: [22.242114343027588, 60.449298344439924] as [number, number], // Todo
          ev_model: "Nissan Leaf", // Get from settings
          current_car_range: 120, // Get from settings
          current_soc: currentSOC[0] || 50,
          desired_soc: desiredSOC[0] || 80,
          connector_type: connectorType,
          cuisines: cuisinePreference
        };

        const data = await getFilteredStations(body);

        stations = Array.isArray(data?.stations) ? data.stations : [];
        setDemoStations(stations);
        //sourceStations = data.stations as any[];
      } catch (err) {
        // Todo: Show empty search page
        console.log("Could not fetch stations from API", err);
      }
      //}

      const filteredStations: ChargingStation[] = stations.map(mapApiStationToChargingStation);

      // const filteredStations = mappedStations.filter((station) => {
      //   if (connectorType !== "any" && !station.chargerTypes.includes(connectorType as any)) {
      //     console.log(`Station ${station.name} filtered out by connector type`); 
      //     return false;
      //   }

      //   if (cuisinePreference !== "any") {
      //     const hasCuisine = station.restaurants.some((r) =>
      //       r.cuisine.some((c) => c.toLowerCase() === cuisinePreference.toLowerCase())
      //     );
      //     if (!hasCuisine) {
      //       console.log(`Station ${station.name} filtered out by cuisine`);
      //       return false;
      //     }
      //   }

      //   return true;
      // });

      if (filteredStations.length > 0) {
        const journey: PlannedJourney = {
          id: Date.now().toString(),
          startLocation: currentUserLocation.address || "Lahti",
          endLocation: endLocation, // Todo What is it
          totalDistance: filteredStations[filteredStations.length - 1]?.distance || 45, // Todo simplify
          estimatedDuration: Math.ceil(filteredStations.reduce((sum, s) => sum + s.distance, 0) / 80 * 60),
          stops: filteredStations.map((station) => ({
            station,
            estimatedArrivalTime: new Date(Date.now() + station.travelTimeMin * 60 * 1000),        
            socAtArrival: station.socAtArrival,
            chargingDuration: station.estimateChargingTimeMin,
            distanceFromStart: station.distance,
            isSelected: false,
          })),
          createdAt: new Date(),
        };

        console.log("Journey created:", journey);
        setPlannedJourney(journey);
        setShowRoutePreview(true);
      } else {
        // Show normal toast or better empty search page
        console.log("No stations found matching criteria");
        toast.error("No charging stations found matching your criteria. Try adjusting your filters."); // Todo fix toast
      }
    } finally {
      setIsPlanning(false);
    }
  };

  // demo fetch button removed; Plan My Route will fetch API automatically when needed

  const startChargingSession = (station: ChargingStation) => {
    const session: ChargingSessionType = {
      id: Date.now().toString(),
      stationId: station.id,
      stationName: station.name,
      startTime: new Date(),
      energyDelivered: 0,
      cost: 0,
      status: "active",
    };
    setActiveSession(session);
    setCurrentTab("session");
  };

  const endChargingSession = () => {
    if (activeSession) {
      setActiveSession({
        ...activeSession,
        endTime: new Date(),
        status: "completed",
      });
      setTimeout(() => setActiveSession(null), 2000);
    }
  };

  const placeRestaurantOrder = (order: RestaurantOrder) => {
    setRestaurantOrders((prev) => [...prev, order]);
  };

  const updateOrderStatus = (orderId: string, status: RestaurantOrder["status"]) => {
    setRestaurantOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status } : order))
    );
  };

  const startJourney = () => {
    setIsJourneyActive(true);
    setShowRoutePreview(false);
    setCurrentTab("session");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Toaster position="top-center" />
      
      <main className="h-full">
        {showRoutePreview && plannedJourney ? (
          <RoutePreview
            journey={plannedJourney}
            onStartJourney={startJourney}
            onPlaceOrder={placeRestaurantOrder}
            onBack={() => setShowRoutePreview(false)}
          />
        ) : (
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsContent value="journey" className="m-0">
              {/* Journey Planner Content */}
              <div className="p-4 space-y-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <RouteIcon className="w-6 h-6 text-green-600" />
                      <h2 className="text-xl font-semibold">Plan Your Journey</h2>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Plan your trip with charging stops and pre-order meals along the way
                  </p>

                  {/* Active Filters Summary - Always visible */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className="bg-blue-50">
                      <Battery className="w-3 h-3 mr-1" />
                      Current: {currentSOC[0]}%
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50">
                      <Navigation className="w-3 h-3 mr-1" />
                      Range: {currentRange[0]} km
                    </Badge>
                    <Badge variant="outline" className="bg-green-50">
                      <Zap className="w-3 h-3 mr-1" />
                      Target: {desiredSOC[0]}%
                    </Badge>
                    {connectorType !== "any" && (
                      <Badge variant="outline" className="bg-purple-50">
                        <Zap className="w-3 h-3 mr-1" />
                        {connectorType}
                      </Badge>
                    )}
                    {cuisinePreference.length > 0 && 
                    cuisinePreference.map(c => (              
                      <Badge key={c} variant="outline" className="bg-orange-50">
                        <UtensilsCrossed className="w-3 h-3 mr-1" />
                        {c[0].toUpperCase() + c.slice(1)}
                      </Badge>
                    ))}
                  </div>

                  {/* Filters Toggle */}
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="w-full mb-4 justify-start"
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-2 text-green-600" />
                    <span className="flex-1 text-left">Journey Preferences</span>
                    {showFilters ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>

                  {/* Filters */}
                  {showFilters && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg mb-4">
                      {/* Battery & Range */}
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <Label className="flex items-center gap-2">
                              <Battery className="w-4 h-4" />
                              Current Battery
                            </Label>
                            <span className="text-sm text-gray-600">{currentSOC[0]}%</span>
                          </div>
                          <Slider
                            value={currentSOC}
                            onValueChange={setCurrentSOC}
                            min={20}
                            max={100}
                            step={5}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <Label className="flex items-center gap-2">
                              <Navigation className="w-4 h-4" />
                              Current Range
                            </Label>
                            <span className="text-sm text-gray-600">{currentRange[0]} km</span>
                          </div>
                          <Slider
                            value={currentRange}
                            onValueChange={setCurrentRange}
                            min={50}
                            max={500}
                            step={10}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <Label className="flex items-center gap-2">
                              <Zap className="w-4 h-4" />
                              Desired Charge at Stops
                            </Label>
                            <span className="text-sm text-green-600">{desiredSOC[0]}%</span>
                          </div>
                          <Slider
                            value={desiredSOC}
                            onValueChange={setDesiredSOC}
                            min={50}
                            max={100}
                            step={5}
                            className="w-full"
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* Connector Type */}
                      <div className="space-y-2">
                        <Label>Connector Type</Label>
                        <Select value={connectorType} onValueChange={setConnectorType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select connector type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any Connector</SelectItem>
                            <SelectItem value="Type 2">Type 2</SelectItem>
                            <SelectItem value="CCS">CCS</SelectItem>
                            <SelectItem value="ChaDeMo">ChaDeMo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Cuisine Preference */}
                      <div className="space-y-2">
                        <Label>Cuisine Preference</Label>
                        <CuisineMultiSelect
                          value={cuisinePreference}
                          onChange={setCuisinePreference}
                        />
                      </div>
                    </div>
                  )}

                  {/* Route Inputs */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                      <Navigation className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs text-gray-500">Current Location</div>
                        <div className="font-medium">{currentUserLocation?.address}</div>
                      </div>
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Destination"
                        value={endLocation}
                        onChange={(e) => setEndLocation(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 mt-0"
                      size="lg"
                      onClick={handlePlanRoute}
                      disabled={!endLocation || isPlanning}
                    >
                      {isPlanning ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Planning Route...
                        </>
                      ) : (
                        <>
                          <RouteIcon className="w-5 h-5 mr-2" />
                          Plan My Route
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="session" className="m-0">
              <ChargingSession
                activeSession={activeSession}
                onEndSession={endChargingSession}
                restaurantOrders={restaurantOrders}
                onUpdateOrderStatus={updateOrderStatus}
                isJourneyActive={isJourneyActive}
                plannedJourney={plannedJourney}
                onStartCharging={startChargingSession}
              />
            </TabsContent>

            <TabsContent value="profile" className="m-0">
              <UserProfile
                restaurantOrders={restaurantOrders}
                pastJourneys={[]}
                onLogout={logout}
              />
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Bottom Navigation */}
      {!showRoutePreview && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="w-full h-16 grid grid-cols-3 rounded-none bg-white">
              <TabsTrigger
                value="journey"
                className="flex flex-col gap-1 data-[state=active]:text-green-600 relative"
              >
                <RouteIcon className="w-5 h-5" />
                <span className="text-xs">Journey</span>
                {isJourneyActive && (
                  <span className="absolute top-2 right-3 w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="session"
                className="flex flex-col gap-1 data-[state=active]:text-green-600 relative"
              >
                <Zap className="w-5 h-5" />
                <span className="text-xs">Active</span>
                {(activeSession?.status === "active" ||
                  restaurantOrders.some((o) =>
                    ["pending", "cooking", "ready"].includes(o.status)
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
    </div>
  );
};
