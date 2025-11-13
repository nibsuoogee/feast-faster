import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RestaurantSelector } from './RestaurantSelector';
import { Restaurant } from '@/types/restaurant';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface DashboardHeaderProps {
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  onSelectRestaurant: (restaurant: Restaurant | null) => void;
  activeOrdersCount: number;
  userName: string;
}

export function DashboardHeader({
  restaurants,
  selectedRestaurant,
  onSelectRestaurant,
  activeOrdersCount,
  userName,
}: DashboardHeaderProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="border-b bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <RestaurantSelector
            restaurants={restaurants}
            selectedRestaurant={selectedRestaurant}
            onSelectRestaurant={onSelectRestaurant}
          />

          <div className="flex items-center gap-2">
            <span className="text-gray-500">Restaurant:</span>
            <span>
              {selectedRestaurant ? selectedRestaurant.name : 'None selected'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-500">Active Orders:</span>
            <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-3 py-1 text-blue-800">
              {activeOrdersCount}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-gray-700">{userName}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </div>
    </header>
  );
}
