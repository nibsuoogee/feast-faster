-- ===========================================
--  TEST DATA: USERS
-- ===========================================
INSERT INTO users (username, email, password, role)
VALUES
  ('test_user_1', 'test1@example.com', 'password1', 'driver'),
  ('test_user_2', 'test2@example.com', 'password2', 'driver'),
  ('test_user_3', 'test3@example.com', 'password3', 'driver'),
  ('test_user_4', 'test4@example.com', 'password4', 'driver'),
  ('test_user_5', 'test5@example.com', 'password5', 'driver'),
  ('rm_1',        'rm1@example.com',   'password6', 'restaurant_manager'),
  ('test_user_6', 'test6@example.com', 'password7', 'driver'),
  ('test_user_7', 'test7@example.com', 'password8', 'driver'),
  ('test_user_8', 'test8@example.com', 'password9', 'driver'),
  ('test_user_9', 'test9@example.com', 'password10','driver');


-- ===========================================
--  TEST DATA: SETTINGS
-- ===========================================
INSERT INTO settings (customer_id, vehicle_model, connector_type, desired_soc, cuisines)
VALUES
  ((SELECT user_id FROM users WHERE username = 'test_user_1'), 'Model S', 'CCS', 80, ARRAY['italian','american']),
  ((SELECT user_id FROM users WHERE username = 'test_user_2'), 'Leaf', 'Type 2', 90, ARRAY['turkish']),
  ((SELECT user_id FROM users WHERE username = 'test_user_3'), 'Ioniq', 'CHAdeMO', 70, ARRAY['asian']),
  ((SELECT user_id FROM users WHERE username = 'test_user_4'), 'Bolt', 'CCS', 85, ARRAY['mexican']),
  ((SELECT user_id FROM users WHERE username = 'test_user_5'), 'e-Golf', 'Type 2', 75, ARRAY['regional']);


-- ===========================================
--  TEST DATA: MENU ITEMS
--  (Restaurant names MUST match your inserts.sql)
-- ===========================================
INSERT INTO menu_items (restaurant_id, name, details, price, minutes_to_prepare, availability)
SELECT r.restaurant_id, v.name, v.details, v.price, v.minutes_to_prepare, v.availability::menu_item_availability
FROM (
  VALUES
    ('House of Sandwiches','Club Sandwich','Toasted club with fries',7.90,10,'available'),
    ('China Wall','Beef Noodles','Spicy beef and noodles',9.50,15,'available'),
    ('Pancho Villa','Chicken Burrito','Large burrito with salsa',8.20,12,'available'),
    ('Fatboy','Margherita Pizza','Classic margherita',10.00,18,'available'),
    ('Ristorante Momento','Pasta Carbonara','Creamy carbonara',11.50,14,'available'),
    ('Kahvila-ravintola Pinetto','Salad Bowl','Seasonal salad',6.50,8,'available'),
    ('House of Sandwiches','Veggie Wrap','Wrap with hummus',6.90,9,'available'),
    ('China Wall','Spring Rolls','4 pcs spring rolls',4.50,7,'available'),
    ('Pancho Villa','Nachos','Cheesy nachos',5.90,8,'available'),
    ('Fatboy','Chicken Wings','8 pcs spicy wings',9.00,15,'available')
) AS v(restaurant_name, name, details, price, minutes_to_prepare, availability)
JOIN restaurants r ON r.name = v.restaurant_name;


-- Fallback: ensure at least 1 menu_item exists
INSERT INTO menu_items (restaurant_id, name, details, price, minutes_to_prepare, availability)
SELECT restaurant_id, 'Fallback Burger', 'A simple fallback burger', 7.0, 12, 'available'::menu_item_availability
FROM restaurants LIMIT 1;


-- ===========================================
--  TEST DATA: ORDERS
-- ===========================================
INSERT INTO orders (customer_id, restaurant_id, total_price, customer_eta, food_status)
VALUES
  ((SELECT user_id FROM users WHERE username='test_user_1'),
   (SELECT restaurant_id FROM restaurants WHERE name ILIKE '%Sandwich%' LIMIT 1),
   15.40, now() + interval '15 minutes', 'pending'),

  ((SELECT user_id FROM users WHERE username='test_user_2'),
   (SELECT restaurant_id FROM restaurants WHERE name ILIKE '%China Wall%' LIMIT 1),
   22.90, now() + interval '25 minutes', 'pending'),

  ((SELECT user_id FROM users WHERE username='test_user_3'),
   (SELECT restaurant_id FROM restaurants WHERE name ILIKE '%Pancho Villa%' LIMIT 1),
   12.30, now() + interval '20 minutes', 'pending'),

  ((SELECT user_id FROM users WHERE username='test_user_4'),
   (SELECT restaurant_id FROM restaurants WHERE name ILIKE '%Fatboy%' LIMIT 1),
   30.00, now() + interval '30 minutes', 'pending'),

  ((SELECT user_id FROM users WHERE username='test_user_5'),
   (SELECT restaurant_id FROM restaurants WHERE name ILIKE '%Momento%' LIMIT 1),
   18.70, now() + interval '22 minutes', 'pending'),

  ((SELECT user_id FROM users WHERE username='test_user_6'),
   (SELECT restaurant_id FROM restaurants LIMIT 1),
   9.99, now() + interval '18 minutes', 'pending'),

  ((SELECT user_id FROM users WHERE username='test_user_7'),
   (SELECT restaurant_id FROM restaurants LIMIT 1 OFFSET 1),
   14.50, now() + interval '16 minutes', 'pending'),

  ((SELECT user_id FROM users WHERE username='test_user_8'),
   (SELECT restaurant_id FROM restaurants LIMIT 1 OFFSET 2),
   11.25, now() + interval '12 minutes', 'pending'),

  ((SELECT user_id FROM users WHERE username='test_user_9'),
   (SELECT restaurant_id FROM restaurants LIMIT 1 OFFSET 3),
   7.80, now() + interval '10 minutes', 'pending'),

  ((SELECT user_id FROM users WHERE username='rm_1'),
   (SELECT restaurant_id FROM restaurants LIMIT 1 OFFSET 4),
   50.00, now() + interval '40 minutes', 'pending');


-- ===========================================
--  TEST DATA: ORDER ITEMS
-- ===========================================
INSERT INTO order_items (order_id, menu_item_id, name, details, price)
SELECT o.order_id, m.menu_item_id, m.name, m.details, m.price
FROM orders o
JOIN menu_items m ON m.restaurant_id = o.restaurant_id
WHERE o.order_id IN (SELECT order_id FROM orders ORDER BY order_id DESC LIMIT 10)
LIMIT 20;


-- ===========================================
--  TEST DATA: LONG-TERM UNIQUE RESERVATIONS
--  (ONE RESERVATION PER CHARGER, 1 YEAR LONG)
-- ===========================================
INSERT INTO reservations (
    order_id,
    charger_id,
    reservation_start,
    reservation_end,
    time_of_payment,
    current_soc,
    cumulative_price_of_charge,
    cumulative_power
)
SELECT
    (SELECT order_id FROM orders ORDER BY order_id LIMIT 1),  -- reuse a valid order
    c.charger_id,
    NOW(),
    NOW() + INTERVAL '1 year',
    NULL,
    20,
    0.0,
    0.0
FROM chargers c
ON CONFLICT DO NOTHING;
