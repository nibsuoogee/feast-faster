import { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Restaurant } from '@/types/restaurant';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RestaurantSelectorProps {
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  onSelectRestaurant: (restaurant: Restaurant | null) => void;
}

export function RestaurantSelector({
  restaurants,
  selectedRestaurant,
  onSelectRestaurant,
}: RestaurantSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const filteredRestaurants = restaurants.filter((restaurant) =>
    restaurant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (restaurant: Restaurant) => {
    onSelectRestaurant(
      selectedRestaurant?.id === restaurant.id ? null : restaurant
    );
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="w-[280px] justify-between bg-white hover:bg-gray-50 border-gray-300 hover:border-green-500 transition-colors"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <span className={selectedRestaurant ? "text-gray-900 font-medium" : "text-gray-500"}>
          {selectedRestaurant ? selectedRestaurant.name : 'Select restaurant...'}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-gray-400" />
      </Button>

      {open && (
        <div className="absolute z-50 mt-2 w-[280px] rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center border-b border-gray-200 px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 text-gray-400" />
            <Input
              placeholder="Search restaurant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
              autoFocus
            />
          </div>

          <ScrollArea className="h-[300px]">
            <div className="p-2">
              {filteredRestaurants.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500">
                  No restaurant found.
                </div>
              ) : (
                filteredRestaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className={`relative flex cursor-pointer items-center rounded-lg px-3 py-2.5 text-sm transition-colors select-none ${
                      selectedRestaurant?.id === restaurant.id
                        ? 'bg-green-50 text-green-900 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => handleSelect(restaurant)}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 transition-opacity ${
                        selectedRestaurant?.id === restaurant.id
                          ? 'opacity-100 text-green-600'
                          : 'opacity-0'
                      }`}
                    />
                    {restaurant.name}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
