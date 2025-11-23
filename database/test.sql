-- ===========================================
--  TEST DATA: USERS
-- ===========================================
-- Passwords are hashed, but are just password1, password2, etc. based on test user id, e.g. test_user_6 would have password7
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
  ((SELECT user_id FROM users WHERE username = 'test_user_1'), 'tesla model s', 'CCS', 80, ARRAY['italian','american']),
  ((SELECT user_id FROM users WHERE username = 'test_user_2'), 'nissan leaf', 'Type 2', 90, ARRAY['turkish']),
  ((SELECT user_id FROM users WHERE username = 'test_user_3'), 'hyundai ioniq', 'CHAdeMO', 70, ARRAY['asian']),
  ((SELECT user_id FROM users WHERE username = 'test_user_4'), 'chevrolet bolt', 'CCS', 85, ARRAY['mexican']),
  ((SELECT user_id FROM users WHERE username = 'test_user_5'), 'volkswagen e-golf', 'Type 2', 75, ARRAY['regional']);