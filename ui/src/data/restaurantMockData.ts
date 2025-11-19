import { Restaurant, Order } from '@/types/restaurant';

export const restaurants: Restaurant[] = [
  { id: '1', name: 'Pizza Paradise' },
  { id: '2', name: 'Burger Boulevard' },
  { id: '3', name: 'Sushi Station' },
  { id: '4', name: 'Taco Temple' },
  { id: '5', name: 'Pasta Palace' },
  { id: '6', name: 'Fish Farm' },
  { id: '7', name: 'Chips n Fish' },
  { id: '8', name: 'Thai Terrace' },
  { id: '9', name: 'Indian Spice' },
  { id: '10', name: 'Chinese Garden' },
  { id: '11', name: 'Greek Grill' },
  { id: '12', name: 'Mexican Fiesta' },
  { id: '13', name: 'French Bistro' },
  { id: '14', name: 'Italian Kitchen' },
  { id: '15', name: 'Spanish Tapas' },
  { id: '16', name: 'Turkish Delight' },
  { id: '17', name: 'Lebanese Lounge' },
  { id: '18', name: 'Vietnamese Villa' },
  { id: '19', name: 'Korean Kitchen' },
  { id: '20', name: 'American Diner' },
  { id: '21', name: 'British Pub' },
  { id: '22', name: 'Irish Tavern' },
  { id: '23', name: 'Scottish Eatery' },
  { id: '24', name: 'Polish Place' },
  { id: '25', name: 'Russian Restaurant' },
  { id: '26', name: 'Brazilian BBQ' },
  { id: '27', name: 'Argentinian Grill' },
  { id: '28', name: 'Caribbean Cafe' },
  { id: '29', name: 'Ethiopian Eats' },
  { id: '30', name: 'Moroccan Meze' },
  { id: '31', name: 'Peruvian Pantry' },
  { id: '32', name: 'Australian Outback' },
];

// Helper function to create a date X minutes from now
const minutesFromNow = (minutes: number): Date => {
  const date = new Date();
  date.setMinutes(date.getMinutes() + minutes);
  return date;
};

export const orders: Order[] = [
  // Pizza Paradise orders
  {
    id: '1',
    orderNumber: 'ORD-1001',
    restaurantId: '1',
    status: 'pending',
    customerETA: minutesFromNow(25),
    items: [
      { name: 'Margherita Pizza', quantity: 2, preparationTime: 15 },
      { name: 'Caesar Salad', quantity: 1, preparationTime: 5 },
    ],
  },
  {
    id: '2',
    orderNumber: 'ORD-1002',
    restaurantId: '1',
    status: 'cooking',
    customerETA: minutesFromNow(18),
    items: [
      { name: 'Pepperoni Pizza', quantity: 1, preparationTime: 15 },
      { name: 'Garlic Bread', quantity: 2, preparationTime: 8 },
    ],
  },
  {
    id: '3',
    orderNumber: 'ORD-1003',
    restaurantId: '1',
    status: 'ready',
    customerETA: minutesFromNow(5),
    items: [
      { name: 'Quattro Formaggi', quantity: 1, preparationTime: 15 },
    ],
  },
  {
    id: '4',
    orderNumber: 'ORD-1004',
    restaurantId: '1',
    status: 'picked_up',
    customerETA: minutesFromNow(-5),
    items: [
      { name: 'Hawaiian Pizza', quantity: 1, preparationTime: 15 },
      { name: 'Mozzarella Sticks', quantity: 1, preparationTime: 10 },
    ],
    chargePercentage: 78,
  },
  {
    id: '5',
    orderNumber: 'ORD-1005',
    restaurantId: '1',
    status: 'pending',
    customerETA: minutesFromNow(30),
    items: [
      { name: 'Veggie Supreme', quantity: 1, preparationTime: 15 },
      { name: 'Chicken Wings', quantity: 12, preparationTime: 20 },
    ],
  },
  {
    id: '6',
    orderNumber: 'ORD-1006',
    restaurantId: '1',
    status: 'cooking',
    customerETA: minutesFromNow(12),
    items: [
      { name: 'BBQ Chicken Pizza', quantity: 2, preparationTime: 15 },
    ],
  },
  // Sushi Station orders
  {
    id: '7',
    orderNumber: 'ORD-2001',
    restaurantId: '3',
    status: 'pending',
    customerETA: minutesFromNow(35),
    items: [
      { name: 'California Roll', quantity: 2, preparationTime: 12 },
      { name: 'Miso Soup', quantity: 2, preparationTime: 5 },
    ],
  },
  {
    id: '8',
    orderNumber: 'ORD-2002',
    restaurantId: '3',
    status: 'cooking',
    customerETA: minutesFromNow(20),
    items: [
      { name: 'Salmon Sashimi', quantity: 1, preparationTime: 10 },
      { name: 'Dragon Roll', quantity: 1, preparationTime: 15 },
    ],
  },
  {
    id: '9',
    orderNumber: 'ORD-2003',
    restaurantId: '3',
    status: 'ready',
    customerETA: minutesFromNow(8),
    items: [
      { name: 'Tempura Udon', quantity: 1, preparationTime: 18 },
    ],
  },
  {
    id: '10',
    orderNumber: 'ORD-2004',
    restaurantId: '3',
    status: 'cooking',
    customerETA: minutesFromNow(15),
    items: [
      { name: 'Spicy Tuna Roll', quantity: 2, preparationTime: 12 },
      { name: 'Edamame', quantity: 1, preparationTime: 3 },
    ],
  },
  // Fish Farm orders
  {
    id: '11',
    orderNumber: 'ORD-3001',
    restaurantId: '6',
    status: 'pending',
    customerETA: minutesFromNow(28),
    items: [
      { name: 'Fish & Chips', quantity: 2, preparationTime: 18 },
      { name: 'Mushy Peas', quantity: 2, preparationTime: 5 },
    ],
  },
  {
    id: '12',
    orderNumber: 'ORD-3002',
    restaurantId: '6',
    status: 'cooking',
    customerETA: minutesFromNow(16),
    items: [
      { name: 'Grilled Salmon', quantity: 1, preparationTime: 20 },
    ],
  },
  {
    id: '13',
    orderNumber: 'ORD-3003',
    restaurantId: '6',
    status: 'ready',
    customerETA: minutesFromNow(6),
    items: [
      { name: 'Calamari', quantity: 1, preparationTime: 12 },
      { name: 'Tartar Sauce', quantity: 2, preparationTime: 2 },
    ],
  },
  // Chips n Fish orders
  {
    id: '14',
    orderNumber: 'ORD-4001',
    restaurantId: '7',
    status: 'pending',
    customerETA: minutesFromNow(22),
    items: [
      { name: 'Classic Fish & Chips', quantity: 1, preparationTime: 18 },
    ],
  },
  {
    id: '15',
    orderNumber: 'ORD-4002',
    restaurantId: '7',
    status: 'ready',
    customerETA: minutesFromNow(4),
    items: [
      { name: 'Chip Butty', quantity: 2, preparationTime: 10 },
      { name: 'Pickled Onion', quantity: 2, preparationTime: 1 },
    ],
  },
  {
    id: '16',
    orderNumber: 'ORD-4003',
    restaurantId: '7',
    status: 'picked_up',
    customerETA: minutesFromNow(-3),
    items: [
      { name: 'Battered Sausage', quantity: 2, preparationTime: 15 },
    ],
    chargePercentage: 45,
  },
];
