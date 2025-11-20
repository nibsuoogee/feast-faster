import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ChargingSession } from "@/components/ChargingSession";
import { UserProfile } from "@/components/UserProfile";
import { RoutePreview } from "@/components/RoutePreview";
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
  Search,
  Filter,
} from "lucide-react";
import MapView from "@/components/MapView";
import { getStationsRestaurantsMock } from "@/services/stations";
import { StationDialog } from "@/components/StationDialog";

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
  id: string;
  name: string;
  cuisine: string[];
  prepTime: string;
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
  rating?: number;
  lat: number;
  lng: number;
  restaurants: Restaurant[];
  amenities?: string[];
};

export type JourneyStop = {
  station: ChargingStation;
  estimatedArrivalTime: Date;
  chargingDuration: number;
  distanceFromStart: number;
  selectedRestaurantId?: string;
  isSelected: boolean;
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
  const [demoStations, setDemoStations] = useState<any[] | null>(null);
  const [connectorType, setConnectorType] = useState<string>("any");
  const [cuisinePreference, setCuisinePreference] = useState<string>("any");
  const [showFilters, setShowFilters] = useState(false);
  const [endLocation, setEndLocation] = useState("");
  const [isPlanning, setIsPlanning] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const [showStationDialog, setShowStationDialog] = useState(false);

  // When the Map tab becomes active, trigger a resize event so Leaflet can recalculate size
  // and increment mapKey to force a fresh mount of MapView (avoid "already initialized" error)
  useEffect(() => {
    if (currentTab === "map") {
      setMapKey(prev => prev + 1);
      setTimeout(() => window.dispatchEvent(new Event("resize")), 250);
    }
  }, [currentTab]);

  // Mock charging stations data
  const stations: ChargingStation[] = [
    {
      id: "1",
      name: "Downtown Charging Hub",
      address: "123 Main St, Lahti",
      distance: 5.2,
      availableChargers: 4,
      totalChargers: 8,
      chargerTypes: ["CCS", "Type 2"],
      pricePerKwh: 0.35,
      rating: 4.5,
      lat: 60.9827,
      lng: 25.6612,
      amenities: ["WiFi", "Cafe", "Restaurant"],
      restaurants: [
        {
          id: "r1",
          name: "Green Leaf Bistro",
          cuisine: ["Vegetarian"],
          prepTime: "15-20 min",
          image: "https://images.unsplash.com/photo-1555057949-7e4a30956f1f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
          menu: [
            {
              id: "m1",
              name: "Quinoa Power Bowl",
              description: "Mixed quinoa, roasted vegetables, avocado, tahini dressing",
              price: 12.99,
              category: "Bowls",
              prepTime: 15,
            },
            {
              id: "m2",
              name: "Green Goddess Smoothie",
              description: "Spinach, banana, mango, almond milk, chia seeds",
              price: 7.99,
              category: "Beverages",
              prepTime: 5,
            },
            {
              id: "m3",
              name: "Grilled Chicken Wrap",
              description: "Herb-marinated chicken, mixed greens, hummus, whole wheat wrap",
              price: 10.99,
              category: "Wraps",
              prepTime: 12,
            },
            {
              id: "m201",
              name: "Mediterranean Salad",
              description: "Fresh tomatoes, cucumber, olives, feta cheese, olive oil",
              price: 9.99,
              category: "Salads",
              prepTime: 10,
            },
          ],
        },
        {
          id: "r2",
          name: "Urban Coffee House",
          cuisine: ["European"],
          prepTime: "5-10 min",
          image: "https://images.unsplash.com/photo-1628565350863-533a3c174b85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
          menu: [
            {
              id: "m4",
              name: "Cappuccino",
              description: "Double shot espresso with steamed milk",
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
              description: "Smashed avocado on sourdough, cherry tomatoes, feta",
              price: 8.99,
              category: "Breakfast",
              prepTime: 8,
            },
            {
              id: "m202",
              name: "Latte",
              description: "Espresso with steamed milk and foam",
              price: 4.99,
              category: "Coffee",
              prepTime: 5,
            },
            {
              id: "m203",
              name: "Chocolate Muffin",
              description: "Rich chocolate muffin with chocolate chips",
              price: 4.50,
              category: "Pastries",
              prepTime: 2,
            },
          ],
        },
      ],
    },
    {
      id: "2",
      name: "Highway Service Station",
      address: "E75 Highway, 45km marker",
      distance: 45.0,
      availableChargers: 6,
      totalChargers: 10,
      chargerTypes: ["CCS", "ChaDeMo"],
      pricePerKwh: 0.42,
      rating: 4.2,
      lat: 61.2827,
      lng: 25.8612,
      amenities: ["Shop", "Cafe"],
      restaurants: [
        {
          id: "r3",
          name: "Burger Junction",
          cuisine: ["American"],
          prepTime: "12-18 min",
          image: "https://images.unsplash.com/photo-1644447381290-85358ae625cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
          menu: [
            {
              id: "m7",
              name: "Classic Cheeseburger",
              description: "Angus beef patty, cheddar, lettuce, tomato, special sauce",
              price: 11.99,
              category: "Burgers",
              prepTime: 15,
            },
            {
              id: "m8",
              name: "Sweet Potato Fries",
              description: "Crispy sweet potato fries with chipotle mayo",
              price: 5.99,
              category: "Sides",
              prepTime: 10,
            },
            {
              id: "m204",
              name: "BBQ Bacon Burger",
              description: "Double beef patty, bacon, BBQ sauce, onion rings",
              price: 13.99,
              category: "Burgers",
              prepTime: 18,
            },
            {
              id: "m205",
              name: "Chicken Wings",
              description: "8 pieces with choice of sauce",
              price: 9.99,
              category: "Appetizers",
              prepTime: 12,
            },
            {
              id: "m206",
              name: "Milkshake",
              description: "Vanilla, chocolate, or strawberry",
              price: 5.50,
              category: "Beverages",
              prepTime: 5,
            },
          ],
        },
        {
          id: "r4",
          name: "Pizza Express",
          cuisine: ["Italian"],
          prepTime: "10-15 min",
          image: "https://images.unsplash.com/photo-1563245738-9169ff58eccf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
          menu: [
            {
              id: "m9",
              name: "Margherita Pizza Slice",
              description: "Fresh mozzarella, basil, San Marzano tomatoes",
              price: 4.99,
              category: "Pizza",
              prepTime: 8,
            },
            {
              id: "m10",
              name: "Pepperoni Pizza Slice",
              description: "Classic pepperoni with mozzarella",
              price: 5.99,
              category: "Pizza",
              prepTime: 8,
            },
            {
              id: "m11",
              name: "Garlic Knots",
              description: "Warm garlic knots with marinara sauce",
              price: 5.99,
              category: "Appetizers",
              prepTime: 10,
            },
          ],
        },
      ],
    },
    {
      id: "3",
      name: "Tesla Supercharger Hämeenlinna",
      address: "Parolantie 52, Hämeenlinna",
      distance: 70.5,
      availableChargers: 8,
      totalChargers: 12,
      chargerTypes: ["CCS", "Type 2"],
      pricePerKwh: 0.38,
      rating: 4.8,
      lat: 60.9959,
      lng: 24.4608,
      amenities: ["WiFi", "Restaurant"],
      restaurants: [
        {
          id: "r5",
          name: "Sushi Express",
          cuisine: ["Asian"],
          prepTime: "10-15 min",
          image: "https://images.unsplash.com/photo-1600470944938-b301e41001c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
          menu: [
            {
              id: "m12",
              name: "California Roll",
              description: "Crab, avocado, cucumber",
              price: 8.99,
              category: "Rolls",
              prepTime: 10,
            },
            {
              id: "m13",
              name: "Spicy Tuna Roll",
              description: "Fresh tuna, spicy mayo, cucumber",
              price: 9.99,
              category: "Rolls",
              prepTime: 10,
            },
            {
              id: "m14",
              name: "Miso Soup",
              description: "Traditional Japanese soup with tofu and seaweed",
              price: 3.99,
              category: "Appetizers",
              prepTime: 5,
            },
            {
              id: "m207",
              name: "Salmon Nigiri",
              description: "Fresh salmon on seasoned rice (2 pieces)",
              price: 6.99,
              category: "Nigiri",
              prepTime: 8,
            },
            {
              id: "m208",
              name: "Edamame",
              description: "Steamed soybeans with sea salt",
              price: 4.99,
              category: "Appetizers",
              prepTime: 5,
            },
          ],
        },
        {
          id: "r6",
          name: "Thai Kitchen",
          cuisine: ["Asian"],
          prepTime: "15-20 min",
          image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
          menu: [
            {
              id: "m15",
              name: "Pad Thai",
              description: "Stir-fried rice noodles with shrimp, peanuts, lime",
              price: 12.99,
              category: "Noodles",
              prepTime: 15,
            },
            {
              id: "m16",
              name: "Green Curry",
              description: "Coconut green curry with vegetables and chicken",
              price: 11.99,
              category: "Curry",
              prepTime: 18,
            },
            {
              id: "m209",
              name: "Tom Yum Soup",
              description: "Spicy and sour Thai soup with shrimp",
              price: 8.99,
              category: "Soups",
              prepTime: 12,
            },
          ],
        },
      ],
    },
    {
      id: "4",
      name: "ABC Charging Point",
      address: "Keskuskatu 15, Tampere",
      distance: 130.0,
      availableChargers: 3,
      totalChargers: 6,
      chargerTypes: ["Type 2", "CCS"],
      pricePerKwh: 0.40,
      rating: 4.3,
      lat: 61.4978,
      lng: 23.7610,
      amenities: ["Cafe", "Shop"],
      restaurants: [
        {
          id: "r7",
          name: "Nordic Grill",
          cuisine: ["European"],
          prepTime: "15-25 min",
          image: "https://images.unsplash.com/photo-1710533820700-dd6f6623cc97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
          menu: [
            {
              id: "m17",
              name: "Grilled Salmon",
              description: "Fresh salmon with dill sauce and vegetables",
              price: 16.99,
              category: "Main Course",
              prepTime: 20,
            },
            {
              id: "m18",
              name: "Caesar Salad",
              description: "Romaine, parmesan, croutons, Caesar dressing",
              price: 9.99,
              category: "Salads",
              prepTime: 10,
            },
            {
              id: "m19",
              name: "Mushroom Soup",
              description: "Creamy forest mushroom soup with bread",
              price: 7.99,
              category: "Soups",
              prepTime: 8,
            },
            {
              id: "m210",
              name: "Reindeer Steak",
              description: "Traditional Finnish reindeer with mashed potatoes",
              price: 18.99,
              category: "Main Course",
              prepTime: 25,
            },
          ],
        },
        {
          id: "r8",
          name: "Coffee & Pastries",
          cuisine: ["European"],
          prepTime: "5-10 min",
          image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
          menu: [
            {
              id: "m20",
              name: "Cinnamon Bun",
              description: "Traditional Finnish korvapuusti",
              price: 3.50,
              category: "Pastries",
              prepTime: 2,
            },
            {
              id: "m21",
              name: "Espresso",
              description: "Strong Italian espresso",
              price: 2.99,
              category: "Coffee",
              prepTime: 3,
            },
            {
              id: "m211",
              name: "Blueberry Pie",
              description: "Fresh Finnish blueberry pie slice",
              price: 4.99,
              category: "Pastries",
              prepTime: 5,
            },
          ],
        },
      ],
    },
  ];

  // Additional charging stations for map view (real locations in Finland)
  const mapStations: ChargingStation[] = [
    ...stations,
    // Helsinki area
    {
      id: "5",
      name: "K-Citymarket Easton",
      address: "Itäkatu 1-7, Helsinki",
      distance: 210.0,
      availableChargers: 0,
      totalChargers: 4,
      chargerTypes: ["CCS", "Type 2"],
      pricePerKwh: 0.39,
      rating: 4.1,
      lat: 60.2107,
      lng: 25.0791,
      amenities: ["Shop"],
      restaurants: [
        {
          id: "r9",
          name: "Market Cafe",
          cuisine: ["European", "Fast Food"],
          prepTime: "10-15 min",
          image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
          menu: [
            {
              id: "m22",
              name: "Chicken Sandwich",
              description: "Grilled chicken, lettuce, tomato, mayo",
              price: 7.99,
              category: "Sandwiches",
              prepTime: 10,
            },
            {
              id: "m23",
              name: "Hot Dog",
              description: "Classic hot dog with mustard and ketchup",
              price: 4.99,
              category: "Fast Food",
              prepTime: 5,
            },
            {
              id: "m24",
              name: "Coffee",
              description: "Fresh brewed coffee",
              price: 2.50,
              category: "Beverages",
              prepTime: 3,
            },
          ],
        },
      ],
    },
    {
      id: "6",
      name: "Itis Shopping Center",
      address: "Itäkatu 1, Helsinki",
      distance: 215.0,
      availableChargers: 2,
      totalChargers: 6,
      chargerTypes: ["CCS", "Type 2"],
      pricePerKwh: 0.42,
      lat: 60.2109,
      lng: 25.0821,
      restaurants: [
        {
          id: "r10",
          name: "Hesburger",
          cuisine: ["Fast Food"],
          prepTime: "8-12 min",
          image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
          menu: [
            {
              id: "m25",
              name: "Classic Burger",
              description: "Beef patty, pickles, onions, special sauce",
              price: 8.50,
              category: "Burgers",
              prepTime: 10,
            },
            {
              id: "m26",
              name: "French Fries",
              description: "Crispy golden fries",
              price: 3.99,
              category: "Sides",
              prepTime: 5,
            },
            {
              id: "m27",
              name: "Soft Drink",
              description: "Choice of cola, sprite, or fanta",
              price: 2.50,
              category: "Beverages",
              prepTime: 2,
            },
          ],
        },
      ],
    },
    // Vantaa
    {
      id: "7",
      name: "Helsinki-Vantaa Airport",
      address: "Lentoasemantie 1, Vantaa",
      distance: 195.0,
      availableChargers: 8,
      totalChargers: 12,
      chargerTypes: ["CCS", "Type 2", "ChaDeMo"],
      pricePerKwh: 0.45,
      rating: 4.7,
      lat: 60.3172,
      lng: 24.9633,
      amenities: ["WiFi", "Restaurant", "Shop"],
      restaurants: [
        {
          id: "r11",
          name: "Airport Lounge",
          cuisine: ["International"],
          prepTime: "15-20 min",
          image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
          menu: [
            {
              id: "m28",
              name: "Club Sandwich",
              description: "Triple-decker with chicken, bacon, lettuce, tomato",
              price: 11.99,
              category: "Sandwiches",
              prepTime: 15,
            },
            {
              id: "m29",
              name: "Greek Salad",
              description: "Fresh vegetables, feta, olives, olive oil",
              price: 10.50,
              category: "Salads",
              prepTime: 10,
            },
            {
              id: "m30",
              name: "Latte Macchiato",
              description: "Espresso with steamed milk layers",
              price: 4.50,
              category: "Beverages",
              prepTime: 5,
            },
          ],
        },
        {
          id: "r12",
          name: "Traveler's Noodles",
          cuisine: ["Asian"],
          prepTime: "12-18 min",
          image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
          menu: [
            {
              id: "m31",
              name: "Teriyaki Chicken Bowl",
              description: "Rice bowl with teriyaki chicken and vegetables",
              price: 12.50,
              category: "Bowls",
              prepTime: 15,
            },
            {
              id: "m32",
              name: "Ramen",
              description: "Japanese noodle soup with pork and egg",
              price: 13.99,
              category: "Noodles",
              prepTime: 18,
            },
          ],
        },
      ],
    },
    {
      id: "8",
      name: "Jumbo Shopping Center",
      address: "Vantaanportinkatu 3, Vantaa",
      distance: 200.0,
      availableChargers: 3,
      totalChargers: 8,
      chargerTypes: ["CCS", "Type 2"],
      pricePerKwh: 0.40,
      lat: 60.2925,
      lng: 25.0424,
      restaurants: [
        {
          id: "r13",
          name: "Food Court Express",
          cuisine: ["International", "Fast Food"],
          prepTime: "10-15 min",
          image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
          menu: [
            {
              id: "m33",
              name: "Chicken Wrap",
              description: "Grilled chicken, vegetables, garlic sauce",
              price: 8.99,
              category: "Wraps",
              prepTime: 12,
            },
            {
              id: "m34",
              name: "Poke Bowl",
              description: "Salmon, rice, edamame, avocado, sesame",
              price: 11.99,
              category: "Bowls",
              prepTime: 10,
            },
            {
              id: "m35",
              name: "Smoothie",
              description: "Mixed berries with yogurt",
              price: 5.50,
              category: "Beverages",
              prepTime: 5,
            },
          ],
        },
      ],
    },
    // Espoo
    {
      id: "9",
      name: "Sello Shopping Center",
      address: "Leppävaarankatu 3-9, Espoo",
      distance: 220.0,
      availableChargers: 0,
      totalChargers: 6,
      chargerTypes: ["CCS", "Type 2"],
      pricePerKwh: 0.41,
      lat: 60.2177,
      lng: 24.8095,
      restaurants: [
        {
          id: "r14",
          name: "Bistro Sello",
          cuisine: ["European", "Mediterranean"],
          prepTime: "15-20 min",
          image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
          menu: [
            {
              id: "m36",
              name: "Pasta Carbonara",
              description: "Creamy pasta with bacon and parmesan",
              price: 10.99,
              category: "Pasta",
              prepTime: 15,
            },
            {
              id: "m37",
              name: "Bruschetta",
              description: "Toasted bread with tomatoes, basil, olive oil",
              price: 6.99,
              category: "Appetizers",
              prepTime: 8,
            },
            {
              id: "m38",
              name: "Tiramisu",
              description: "Classic Italian dessert with coffee",
              price: 5.99,
              category: "Desserts",
              prepTime: 5,
            },
          ],
        },
      ],
    },
    {
      id: "10",
      name: "Iso Omena",
      address: "Piispansilta 11, Espoo",
      distance: 225.0,
      availableChargers: 5,
      totalChargers: 10,
      chargerTypes: ["CCS", "Type 2"],
      pricePerKwh: 0.38,
      lat: 60.1616,
      lng: 24.7373,
      restaurants: [
        {
          id: "r15",
          name: "Taco Bell",
          cuisine: ["Mexican"],
          prepTime: "10-15 min",
          image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
          menu: [
            {
              id: "m39",
              name: "Crunchy Taco Supreme",
              description: "Seasoned beef, lettuce, cheese, tomatoes, sour cream",
              price: 4.99,
              category: "Tacos",
              prepTime: 10,
            },
            {
              id: "m40",
              name: "Burrito Bowl",
              description: "Rice, beans, meat, cheese, salsa, guacamole",
              price: 9.99,
              category: "Bowls",
              prepTime: 12,
            },
            {
              id: "m41",
              name: "Nachos Supreme",
              description: "Tortilla chips with cheese, jalapeños, sour cream",
              price: 7.99,
              category: "Appetizers",
              prepTime: 8,
            },
          ],
        },
      ],
    },
    // Between Lahti and Helsinki
    {
      id: "11",
      name: "ABC Mäntsälä",
      address: "Ratatie 2, Mäntsälä",
      distance: 35.0,
      availableChargers: 4,
      totalChargers: 6,
      chargerTypes: ["CCS", "Type 2"],
      pricePerKwh: 0.40,
      lat: 60.6349,
      lng: 25.3173,
      restaurants: [
        {
          id: "r16",
          name: "ABC Restaurant",
          cuisine: ["Finnish"],
          prepTime: "15-20 min",
          image: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
          menu: [
            {
              id: "m42",
              name: "Karelian Pasty",
              description: "Traditional Finnish rice pasty with egg butter",
              price: 3.50,
              category: "Finnish Specialties",
              prepTime: 5,
            },
            {
              id: "m43",
              name: "Meat Soup",
              description: "Hearty Finnish soup with vegetables",
              price: 8.50,
              category: "Soups",
              prepTime: 15,
            },
            {
              id: "m44",
              name: "Coffee & Pulla",
              description: "Finnish coffee with sweet cardamom bread",
              price: 4.99,
              category: "Coffee & Pastries",
              prepTime: 3,
            },
          ],
        },
      ],
    },
    {
      id: "12",
      name: "Orimattila ABC",
      address: "Lähteläntie 1, Orimattila",
      distance: 25.0,
      availableChargers: 0,
      totalChargers: 4,
      chargerTypes: ["CCS"],
      pricePerKwh: 0.42,
      lat: 60.8046,
      lng: 25.7296,
      restaurants: [
        {
          id: "r17",
          name: "Roadside Grill",
          cuisine: ["Grill", "Fast Food"],
          prepTime: "12-18 min",
          image: "https://images.unsplash.com/photo-1558030006-450675393462?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
          menu: [
            {
              id: "m45",
              name: "BBQ Ribs",
              description: "Slow-cooked ribs with BBQ sauce and fries",
              price: 14.99,
              category: "Grill",
              prepTime: 18,
            },
            {
              id: "m46",
              name: "Grilled Sausage",
              description: "Finnish grilled sausage with mustard",
              price: 5.50,
              category: "Grill",
              prepTime: 10,
            },
            {
              id: "m47",
              name: "Onion Rings",
              description: "Crispy battered onion rings",
              price: 4.50,
              category: "Sides",
              prepTime: 8,
            },
          ],
        },
      ],
    },
    // Lahti area
    {
      id: "13",
      name: "Lahti Travel Center",
      address: "Rautatienkatu 22, Lahti",
      distance: 2.0,
      availableChargers: 6,
      totalChargers: 8,
      chargerTypes: ["CCS", "Type 2", "ChaDeMo"],
      pricePerKwh: 0.37,
      lat: 60.9826,
      lng: 25.6559,
      restaurants: [
        {
          id: "r18",
          name: "Station Cafe",
          cuisine: ["European", "Cafe"],
          prepTime: "5-10 min",
          image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
          menu: [
            {
              id: "m48",
              name: "Ham & Cheese Croissant",
              description: "Flaky croissant with ham and cheese",
              price: 5.50,
              category: "Pastries",
              prepTime: 5,
            },
            {
              id: "m49",
              name: "Cappuccino",
              description: "Classic Italian cappuccino",
              price: 3.99,
              category: "Coffee",
              prepTime: 5,
            },
            {
              id: "m50",
              name: "Danish Pastry",
              description: "Sweet pastry with fruit filling",
              price: 3.50,
              category: "Pastries",
              prepTime: 2,
            },
          ],
        },
      ],
    },
    {
      id: "14",
      name: "Karisma Shopping Center",
      address: "Kauppakatu 10, Lahti",
      distance: 1.5,
      availableChargers: 2,
      totalChargers: 4,
      chargerTypes: ["Type 2", "CCS"],
      pricePerKwh: 0.39,
      lat: 60.9833,
      lng: 25.6552,
      restaurants: [
        {
          id: "r19",
          name: "Subway",
          cuisine: ["Sandwiches", "Fast Food"],
          prepTime: "8-12 min",
          image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
          menu: [
            {
              id: "m51",
              name: "Italian BMT",
              description: "Salami, pepperoni, ham with vegetables",
              price: 7.99,
              category: "Subs",
              prepTime: 10,
            },
            {
              id: "m52",
              name: "Veggie Delite",
              description: "Fresh vegetables and cheese",
              price: 6.50,
              category: "Subs",
              prepTime: 8,
            },
            {
              id: "m53",
              name: "Cookies",
              description: "Freshly baked chocolate chip cookies",
              price: 2.99,
              category: "Desserts",
              prepTime: 2,
            },
          ],
        },
      ],
    },
    // Towards Tampere
    {
      id: "15",
      name: "Hollola ABC",
      address: "Hämeentie 133, Hollola",
      distance: 15.0,
      availableChargers: 0,
      totalChargers: 4,
      chargerTypes: ["CCS", "Type 2"],
      pricePerKwh: 0.41,
      lat: 61.0538,
      lng: 25.4373,
      restaurants: [
        {
          id: "r20",
          name: "Highway Diner",
          cuisine: ["American", "Diner"],
          prepTime: "12-20 min",
          image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
          menu: [
            {
              id: "m54",
              name: "Pancakes with Syrup",
              description: "Stack of fluffy pancakes with maple syrup",
              price: 7.99,
              category: "Breakfast",
              prepTime: 12,
            },
            {
              id: "m55",
              name: "Bacon & Eggs",
              description: "Crispy bacon with fried eggs and toast",
              price: 9.50,
              category: "Breakfast",
              prepTime: 15,
            },
            {
              id: "m56",
              name: "Apple Pie",
              description: "Warm apple pie with vanilla ice cream",
              price: 5.99,
              category: "Desserts",
              prepTime: 8,
            },
          ],
        },
      ],
    },
  ];

  const handlePlanRoute = async () => {
    if (!endLocation) return;

    console.log("Planning route to:", endLocation);
    console.log("Filters:", { connectorType, cuisinePreference, currentSOC, currentRange, desiredSOC });

    setIsPlanning(true);

    // If demoStations (API results) exist, use them; otherwise try to fetch the API now
    let sourceStations: any[] = [];
    if (demoStations && demoStations.length > 0) {
      sourceStations = demoStations;
    }

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

      const restaurants = Array.isArray(s.restaurants) ? s.restaurants.map((r: any, idx: number) => ({
        id: String(r.restaurant_id || r.id || `${s.station_id}-r${idx}`),
        name: r.name || "Unknown",
        cuisine: Array.isArray(r.cuisines) ? r.cuisines : (r.cuisine ? [r.cuisine] : ["Unknown"]),
        prepTime: (s.estimate_charging_time_min ? `${s.estimate_charging_time_min} min` : "15-25 min"),
        image: r.image || "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=400&q=80",
        menu: staticMenuForApiRestaurant(r), // attach small static menu so ordering UI works
      })) : [];

      return {
        id: String(s.station_id),
        name: s.name || "Charging Station",
        address: s.address || "",
        distance: typeof s.distance_km === "number" ? s.distance_km : (s.distance || 0),
        availableChargers,
        totalChargers,
        chargerTypes: chargerTypes as any,
        pricePerKwh: typeof s.price_per_kwh === "number" ? s.price_per_kwh : 0.4,
        lat: typeof s.lat === "number" ? s.lat : 0,
        lng: typeof s.lng === "number" ? s.lng : 0,
        restaurants,
      };
    };

    try {
      if (sourceStations.length === 0) {
        try {
          const body = {
            current_location: [60.984, 25.663] as [number, number],
            destination: endLocation || "Tampere",
            ev_model: "Nissan Leaf",
            current_car_range: 120,
            current_soc: currentSOC[0] || 50,
            desired_soc: desiredSOC[0] || 80,
          };
          const data = await getStationsRestaurantsMock(body);
          if (data && Array.isArray(data)) {
            sourceStations = data as any[];
            setDemoStations(sourceStations as any[]);
          }
        } catch (err) {
          console.warn("Could not fetch stations from API, falling back to static data", err);
        }
      }

      const mappedStations: ChargingStation[] = (sourceStations.length > 0 ? sourceStations.map(mapApiStationToChargingStation) : stations);

      const filteredStations = mappedStations.filter((station) => {
        if (connectorType !== "any" && !station.chargerTypes.includes(connectorType as any)) {
          console.log(`Station ${station.name} filtered out by connector type`);
          return false;
        }

        if (cuisinePreference !== "any") {
          const hasCuisine = station.restaurants.some((r) =>
            r.cuisine.some((c) => c.toLowerCase() === cuisinePreference.toLowerCase())
          );
          if (!hasCuisine) {
            console.log(`Station ${station.name} filtered out by cuisine`);
            return false;
          }
        }

        return true;
      });

      console.log("Filtered stations:", filteredStations.length);

      if (filteredStations.length > 0) {
        const journey: PlannedJourney = {
          id: Date.now().toString(),
          startLocation: "Lahti",
          endLocation: endLocation,
          totalDistance: filteredStations[filteredStations.length - 1]?.distance || 45,
          estimatedDuration: Math.ceil(filteredStations.reduce((sum, s) => sum + s.distance, 0) / 80 * 60),
          stops: filteredStations.map((station) => ({
            station,
            estimatedArrivalTime: new Date(Date.now() + (station.distance / 80) * 60 * 60 * 1000),
            chargingDuration: 30,
            distanceFromStart: station.distance,
            isSelected: false,
          })),
          createdAt: new Date(),
        };

        console.log("Journey created:", journey);
        setPlannedJourney(journey);
        setShowRoutePreview(true);
      } else {
        console.log("No stations found matching criteria");
        toast.error("No charging stations found matching your criteria. Try adjusting your filters or selecting 'Any' for connector type and cuisine.");
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
                    {cuisinePreference !== "any" && (
                      <Badge variant="outline" className="bg-orange-50">
                        <UtensilsCrossed className="w-3 h-3 mr-1" />
                        {cuisinePreference}
                      </Badge>
                    )}
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
                        <Select value={cuisinePreference} onValueChange={setCuisinePreference}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select cuisine" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any Cuisine</SelectItem>
                            <SelectItem value="american">American</SelectItem>
                            <SelectItem value="asian">Asian</SelectItem>
                            <SelectItem value="vegetarian">Vegetarian</SelectItem>
                            <SelectItem value="italian">Italian</SelectItem>
                            <SelectItem value="european">European</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Route Inputs */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                      <Navigation className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs text-gray-500">Current Location</div>
                        <div className="font-medium">Lahti</div>
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

            <TabsContent value="map" className="m-0">
              <div className="relative h-[calc(100vh-120px)]">
                {/* Search Bar */}
                <div className="absolute top-4 left-20 right-4 z-[1000] flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search for charging stations..."
                      value={mapSearchQuery}
                      onChange={(e) => setMapSearchQuery(e.target.value)}
                      className="pl-9 bg-white shadow-lg"
                    />
                  </div>
                  <Button variant="outline" size="icon" className="bg-white shadow-lg">
                    <Filter className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="bg-white shadow-lg">
                    <Navigation className="w-4 h-4" />
                  </Button>
                </div>

                {/* Map */}
                <div className="w-full h-full relative z-0">
                  {currentTab === "map" && (
                    <MapView 
                      key={mapKey} 
                      active 
                      stations={mapStations}
                      onStationClick={(station) => {
                        setSelectedStation(station as any);
                        setShowStationDialog(true);
                      }}
                    />
                  )}
                </div>

                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-sm z-[1000]">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-green-600 rounded-full" />
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full" />
                    <span>Occupied</span>
                  </div>
                </div>
              </div>
              
              {/* Station Dialog */}
              <StationDialog
                station={selectedStation}
                open={showStationDialog}
                onClose={() => setShowStationDialog(false)}
                onNavigate={(station) => {
                  console.log('Navigate to station:', station);
                  setShowStationDialog(false);
                  // TODO: Implement navigation
                }}
                onStartCharging={(station) => {
                  console.log('Start charging at:', station);
                  startChargingSession(station as any);
                  setShowStationDialog(false);
                }}
              />
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
            <TabsList className="w-full h-16 grid grid-cols-4 rounded-none bg-white">
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
                value="map"
                className="flex flex-col gap-1 data-[state=active]:text-green-600 relative"
              >
                <MapPin className="w-5 h-5" />
                <span className="text-xs">Map</span>
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
