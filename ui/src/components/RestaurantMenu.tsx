import { useState } from "react";
import { Restaurant, MenuItem, RestaurantOrder } from "@/pages/home";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  X,
  Plus,
  Minus,
  ShoppingCart,
  Clock,
  Star,
  DollarSign,
  Check,
} from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { toast } from "sonner";

type RestaurantMenuProps = {
  restaurant: Restaurant;
  stationId: string;
  stationName: string;
  onClose: () => void;
  onPlaceOrder: (order: RestaurantOrder) => void;
};

export function RestaurantMenu({
  restaurant,
  stationId,
  stationName,
  onClose,
  onPlaceOrder,
}: RestaurantMenuProps) {
  const [cart, setCart] = useState<
    { menuItem: MenuItem; quantity: number }[]
  >([]);
  const [showCheckout, setShowCheckout] = useState(false);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find(
        (i) => i.menuItem.id === item.id,
      );
      if (existing) {
        return prev.map((i) =>
          i.menuItem.id === item.id
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find(
        (i) => i.menuItem.id === itemId,
      );
      if (existing && existing.quantity > 1) {
        return prev.map((i) =>
          i.menuItem.id === itemId
            ? { ...i, quantity: i.quantity - 1 }
            : i,
        );
      }
      return prev.filter((i) => i.menuItem.id !== itemId);
    });
  };

  const totalCost = cart.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0,
  );

  const categories = [
    ...new Set(restaurant.menu.map((item) => item.category)),
  ];

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;

    const order: RestaurantOrder = {
      id: Date.now().toString(),
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      stationId,
      stationName,
      items: cart,
      totalCost,
      status: "pending",
      orderTime: new Date(),
      isPaid: true, // Payment taken in advance
    };

    onPlaceOrder(order);
    toast.success(
      "Order placed successfully! Payment processed.",
    );
    onClose();
  };

  if (showCheckout) {
    return (
      <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center">
        <div className="bg-white w-full md:max-w-2xl md:rounded-lg h-full overflow-y-auto rounded-t-2xl">
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
            <h2>Checkout</h2>
            <button
              onClick={() => setShowCheckout(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Order Summary */}
            <Card className="p-4">
              <h3 className="mb-3">Order Summary</h3>
              <div className="space-y-2">
                {cart.map((item) => (
                  <div
                    key={item.menuItem.id}
                    className="flex justify-between items-start"
                  >
                    <div className="flex-1">
                      <div>{item.menuItem.name}</div>
                      <div className="text-sm text-gray-600">
                        ${item.menuItem.price.toFixed(2)} ×{" "}
                        {item.quantity}
                      </div>
                    </div>
                    <div>
                      $
                      {(
                        item.menuItem.price * item.quantity
                      ).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between items-center">
                <span>Total</span>
                <span className="text-xl">
                  ${totalCost.toFixed(2)}
                </span>
              </div>
            </Card>

            {/* Payment Info */}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-2">
                <DollarSign className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p>Payment will be processed immediately</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Your order will be ready for pickup when you
                    arrive at the station
                  </p>
                </div>
              </div>
            </Card>

            {/* Pickup Info */}
            <Card className="p-4">
              <h3 className="mb-2">Pickup Location</h3>
              <p className="text-gray-600">{restaurant.name}</p>
              <p className="text-sm text-gray-600">
                {stationName}
              </p>
              <div className="flex items-center gap-2 mt-2 text-sm">
                <Clock className="w-4 h-4 text-gray-600" />
                <span>Ready in {restaurant.prepTime}</span>
              </div>
            </Card>

            {/* Payment Method */}
            <Card className="p-4">
              <h3 className="mb-3">Payment Method</h3>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-green-600 rounded flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div>Visa •••• 4242</div>
                  <div className="text-sm text-gray-600">
                    Default payment
                  </div>
                </div>
              </div>
            </Card>

            <Button
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={handlePlaceOrder}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Place Order & Pay ${totalCost.toFixed(2)}
            </Button>

            <p className="text-xs text-center text-gray-500">
              By placing this order, you agree to pay the total
              amount in advance
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    // <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center md:justify-center">
    //   <div className="bg-white w-full md:max-w-2xl md:rounded-lg max-h-[90vh] overflow-hidden rounded-t-2xl flex flex-col">
    <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center">
      <div className="bg-white w-full md:max-w-2xl md:rounded-lg h-full overflow-y-auto rounded-t-2xl flex flex-col">
        {/* Header */}
        <div className="bg-white border-b p-4 flex justify-between items-start">
          <div className="flex-1">
            <h2 className="mb-1">{restaurant.name}</h2>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              {restaurant.cuisine.map((c) => (
                <span>{c}</span>
              ))}
              {/* <span>•</span> */}
              {/* <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                {restaurant.rating}
              </div>
              <span>•</span>
              <span>{restaurant.priceRange}</span>
              <span>•</span> */}
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {restaurant.prepTime}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Menu */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {categories.map((category) => (
              <div key={category}>
                <h3 className="mb-3">{category}</h3>
                <div className="space-y-3">
                  {restaurant.menu
                    .filter(
                      (item) => item.category === category,
                    )
                    .map((item) => {
                      const cartItem = cart.find(
                        (i) => i.menuItem.id === item.id,
                      );
                      const quantity = cartItem?.quantity || 0;

                      return (
                        <Card key={item.id} className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h4 className="mb-1">
                                {item.name}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">
                                {item.description}
                              </p>
                              <div className="flex items-center gap-3">
                                <span>
                                  ${item.price.toFixed(2)}
                                </span>
                                <span className="text-sm text-gray-600 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {item.prepTime} min
                                </span>
                              </div>
                            </div>
                          </div>

                          {quantity > 0 ? (
                            <div className="flex items-center justify-end gap-3">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                                onClick={() =>
                                  removeFromCart(item.id)
                                }
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-8 text-center">
                                {quantity}
                              </span>
                              <Button
                                size="icon"
                                className="h-8 w-8 bg-green-600 hover:bg-green-700"
                                onClick={() => addToCart(item)}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full"
                              onClick={() => addToCart(item)}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add to Cart
                            </Button>
                          )}
                        </Card>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Cart Footer */}
        {cart.length > 0 && (
          <div className="border-t bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm text-gray-600">
                  {cart.reduce(
                    (sum, item) => sum + item.quantity,
                    0,
                  )}{" "}
                  {cart.length === 1 ? "item" : "items"}
                </div>
                <div className="text-xl">
                  ${totalCost.toFixed(2)}
                </div>
              </div>
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setShowCheckout(true)}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Checkout
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}