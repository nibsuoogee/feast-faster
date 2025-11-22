-- ===========================================
--  TEST DATA: USERS
-- ===========================================
-- Passwords are hashed, but are just password1, password2, etc. based on test user number
INSERT INTO users (username, email, password, role)
VALUES
  ('test_user_1', 'test1@example.com', '$argon2id$v=19$m=65536,t=2,p=1$Gxx8t4mjE8mhbKNVMwH2eziTDX6nlwmbH/pH+F3+s9M$jDtoR07+JMJxFH77+AqkzHC72keeHaY0cNABwLMNx9w', 'driver'),
  ('test_user_2', 'test2@example.com', '$argon2id$v=19$m=65536,t=2,p=1$5eHel586ZaPmOeyi6QFwJf3u2TpBIgEmqo5IYzyMyGM$sS95oAutdDA+D9UuNSLv7KEc0FEogJzIR+OBhe/7peQ', 'driver'),
  ('test_user_3', 'test3@example.com', '$argon2id$v=19$m=65536,t=2,p=1$LcnSVyTE5qzstLyqvu09zMu0yXS1iikTWserK3HGTXM$+wvyQzP+ID8nPoDAlfHId2kEC95MMnOODZ59EnFXXmE', 'driver'),
  ('test_user_4', 'test4@example.com', '$argon2id$v=19$m=65536,t=2,p=1$T1N6+hqJ2XkrXGSyfORga/VJHb3Lglwqh0g1MhLFXas$ONPWCd5OSaNG8JGoLwLB8iqrbhmcxiNSwOmBaI3s8/M', 'driver'),
  ('test_user_5', 'test5@example.com', '$argon2id$v=19$m=65536,t=2,p=1$TikzuBFNZ7WIxqguZiNIvxv+Q6tA0JyIxcLG1wy2CgM$FJ74KXO6Cl4ObtQwKloLxxas9p3BBuMWx1i5WyvzlQI', 'driver'),
  ('rm_1',        'rm1@example.com',   '$argon2id$v=19$m=65536,t=2,p=1$Tu2A/UTjt+4WJVtfqo/GvwLDNbEouY/XOowfPJKLs2Q$6T1V1eXEjDo8LdR22YkuzSGMsJ3A2aVp0t9UVcsYGs0', 'restaurant_manager'),
  ('test_user_6', 'test6@example.com', '$argon2id$v=19$m=65536,t=2,p=1$bIT8InTv5SQo0YEP8K+A2zXJ1pL1kyU46PBNC281ycA$ONQhANisDDGPuRkq11e6YB6bvESXwVI1IrI89aZFWsE', 'driver'),
  ('test_user_7', 'test7@example.com', '$argon2id$v=19$m=65536,t=2,p=1$ysmloYkINdLEkbmt0GYpbfV2fiNPazRTc5vBUmkUEXU$q2s6Xe9XPZY6g3tmgjL6VAk7pdN736UjJTU+23L3iK0', 'driver'),
  ('test_user_8', 'test8@example.com', '$argon2id$v=19$m=65536,t=2,p=1$xd2eREpdvPSbVPBKnMPo+Odr6Ng8eWXR8HqpWiRk0uQ$ONLb0DgTvNN9J23ahPcB6sbNb7oyv8vfBgr3LVlIyw0', 'driver'),
  ('test_user_9', 'test9@example.com', '$argon2id$v=19$m=65536,t=2,p=1$jmofaY8A8BtW8m45ba13kz+FuNMjhgY6Q3wKo5bdD/s$5tZi74XqLS9F9QA7mMGm9P4WzkEznROZ/1tRuJeWKUo','driver');


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
-- Fallback: ensure at least 1 menu_item exists
-- ===========================================
INSERT INTO menu_items (restaurant_id, name, details, price, minutes_to_prepare, availability, category)
SELECT restaurant_id, 'Fallback Burger', 'A simple fallback burger', 7.0, 12, 'available'::menu_item_availability, 'Mains'::food_category
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
