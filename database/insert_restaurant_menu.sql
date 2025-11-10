-- 1 DELETE existing rows to avoid PK conflicts
DELETE FROM menu_items;
DELETE FROM restaurants;

-- 2 INSERT restaurants
INSERT INTO restaurants (restaurant_id, station_id, location, name, cuisines, address)
VALUES
(1, 1, 'POINT(0 0)', 'Green Leaf Bistro', ARRAY['Vegetarian'], 'N/A'),
(2, 1, 'POINT(0 0)', 'Urban Coffee House', ARRAY['European'], 'N/A'),
(3, 2, 'POINT(61.2827 25.8612)', 'Burger Junction', ARRAY['American'], 'E75 Highway, 45km marker'),
(4, 2, 'POINT(61.2827 25.8612)', 'Pizza Express', ARRAY['Italian'], 'E75 Highway, 45km marker'),
(5, 3, 'POINT(60.9959 24.4608)', 'Sushi Express', ARRAY['Asian'], 'Parolantie 52, Hämeenlinna'),
(6, 3, 'POINT(60.9959 24.4608)', 'Thai Kitchen', ARRAY['Asian'], 'Parolantie 52, Hämeenlinna'),
(7, 4, 'POINT(61.4978 23.7610)', 'Nordic Grill', ARRAY['European'], 'Keskuskatu 15, Tampere'),
(8, 4, 'POINT(61.4978 23.7610)', 'Coffee & Pastries', ARRAY['European'], 'Keskuskatu 15, Tampere');

-- 3 INSERT menu items

-- Green Leaf Bistro (r1 -> 1)
INSERT INTO menu_items (menu_item_id, restaurant_id, name, details, price, minutes_to_prepare, availability)
VALUES
(1, 1, 'Quinoa Power Bowl', 'Mixed quinoa, roasted vegetables, avocado, tahini dressing', 12.99, 15, 'available'),
(2, 1, 'Green Goddess Smoothie', 'Spinach, banana, mango, almond milk, chia seeds', 7.99, 5, 'available'),
(3, 1, 'Grilled Chicken Wrap', 'Herb-marinated chicken, mixed greens, hummus, whole wheat wrap', 10.99, 12, 'available'),
(201, 1, 'Mediterranean Salad', 'Fresh tomatoes, cucumber, olives, feta cheese, olive oil', 9.99, 10, 'available');

-- Urban Coffee House (r2 -> 2)
INSERT INTO menu_items (menu_item_id, restaurant_id, name, details, price, minutes_to_prepare, availability)
VALUES
(4, 2, 'Cappuccino', 'Double shot espresso with steamed milk', 4.5, 5, 'available'),
(5, 2, 'Croissant', 'Freshly baked butter croissant', 3.99, 2, 'available'),
(6, 2, 'Avocado Toast', 'Smashed avocado on sourdough, cherry tomatoes, feta', 8.99, 8, 'available'),
(202, 2, 'Latte', 'Espresso with steamed milk and foam', 4.99, 5, 'available'),
(203, 2, 'Chocolate Muffin', 'Rich chocolate muffin with chocolate chips', 4.50, 2, 'available');

-- Burger Junction (r3 -> 3)
INSERT INTO menu_items (menu_item_id, restaurant_id, name, details, price, minutes_to_prepare, availability)
VALUES
(7, 3, 'Classic Cheeseburger', 'Angus beef patty, cheddar, lettuce, tomato, special sauce', 11.99, 15, 'available'),
(8, 3, 'Sweet Potato Fries', 'Crispy sweet potato fries with chipotle mayo', 5.99, 10, 'available'),
(204, 3, 'BBQ Bacon Burger', 'Double beef patty, bacon, BBQ sauce, onion rings', 13.99, 18, 'available'),
(205, 3, 'Chicken Wings', '8 pieces with choice of sauce', 9.99, 12, 'available'),
(206, 3, 'Milkshake', 'Vanilla, chocolate, or strawberry', 5.50, 5, 'available');

-- Pizza Express (r4 -> 4)
INSERT INTO menu_items (menu_item_id, restaurant_id, name, details, price, minutes_to_prepare, availability)
VALUES
(9, 4, 'Margherita Pizza Slice', 'Fresh mozzarella, basil, San Marzano tomatoes', 4.99, 8, 'available'),
(10, 4, 'Pepperoni Pizza Slice', 'Classic pepperoni with mozzarella', 5.99, 8, 'available'),
(11, 4, 'Garlic Knots', 'Warm garlic knots with marinara sauce', 5.99, 10, 'available');

-- Sushi Express (r5 -> 5)
INSERT INTO menu_items (menu_item_id, restaurant_id, name, details, price, minutes_to_prepare, availability)
VALUES
(12, 5, 'California Roll', 'Crab, avocado, cucumber', 8.99, 10, 'available'),
(13, 5, 'Spicy Tuna Roll', 'Fresh tuna, spicy mayo, cucumber', 9.99, 10, 'available'),
(14, 5, 'Miso Soup', 'Traditional Japanese soup with tofu and seaweed', 3.99, 5, 'available'),
(207, 5, 'Salmon Nigiri', 'Fresh salmon on seasoned rice (2 pieces)', 6.99, 8, 'available'),
(208, 5, 'Edamame', 'Steamed soybeans with sea salt', 4.99, 5, 'available');

-- Thai Kitchen (r6 -> 6)
INSERT INTO menu_items (menu_item_id, restaurant_id, name, details, price, minutes_to_prepare, availability)
VALUES
(15, 6, 'Pad Thai', 'Stir-fried rice noodles with shrimp, peanuts, lime', 12.99, 15, 'available'),
(16, 6, 'Green Curry', 'Coconut green curry with vegetables and chicken', 11.99, 18, 'available'),
(209, 6, 'Tom Yum Soup', 'Spicy and sour Thai soup with shrimp', 8.99, 12, 'available');

-- Nordic Grill (r7 -> 7)
INSERT INTO menu_items (menu_item_id, restaurant_id, name, details, price, minutes_to_prepare, availability)
VALUES
(17, 7, 'Grilled Salmon', 'Fresh salmon with dill sauce and vegetables', 16.99, 20, 'available'),
(18, 7, 'Caesar Salad', 'Romaine, parmesan, croutons, Caesar dressing', 9.99, 10, 'available'),
(19, 7, 'Mushroom Soup', 'Creamy forest mushroom soup with bread', 7.99, 8, 'available'),
(210, 7, 'Reindeer Steak', 'Traditional Finnish reindeer with mashed potatoes', 18.99, 25, 'available');

-- Coffee & Pastries (r8 -> 8)
INSERT INTO menu_items (menu_item_id, restaurant_id, name, details, price, minutes_to_prepare, availability)
VALUES
(20, 8, 'Cinnamon Bun', 'Traditional Finnish korvapuusti', 3.50, 2, 'available'),
(21, 8, 'Espresso', 'Strong Italian espresso', 2.99, 3, 'available'),
(211, 8, 'Blueberry Pie', 'Fresh Finnish blueberry pie slice', 4.99, 5, 'available');


-- Clean existing data
DELETE FROM chargers;
DELETE FROM stations;

-- STATIONS
INSERT INTO stations (station_id, name, address, location)
VALUES
(1, 'Feast-faster 1 Pakila Helsinki', 'Pakilantie 45, Helsinki', 'POINT(24.932 60.241)'),
(2, 'Feast-faster 2 Highway Stop', 'E75 Highway, 45km marker', 'POINT(25.661 60.982)'),
(3, 'Feast-faster 3 Hämeenlinna', 'Parolantie 52, Hämeenlinna', 'POINT(24.4608 60.9959)'),
(4, 'Feast-faster 4 Tampere', 'Keskuskatu 15, Tampere', 'POINT(23.761 61.4978)');

-- CHARGERS
INSERT INTO chargers (charger_id, station_id, status, connector_type, power, location)
VALUES
(1, 1, 'available', 'CCS', 150, 'POINT(24.932 60.241)'),
(2, 1, 'available', 'Type 2', 50, 'POINT(24.932 60.241)'),
(3, 2, 'reserved_not_in_use', 'CHAdeMO', 150, 'POINT(25.661 60.982)'),
(4, 2, 'available', 'CCS', 50, 'POINT(25.661 60.982)'),
(5, 3, 'available', 'CCS', 300, 'POINT(24.4608 60.9959)'),
(6, 3, 'charging_stopped', 'Type 2', 50, 'POINT(24.4608 60.9959)'),
(7, 4, 'available', 'CHAdeMO', 150, 'POINT(23.761 61.4978)'),
(8, 4, 'available', 'CCS', 50, 'POINT(23.761 61.4978)');
