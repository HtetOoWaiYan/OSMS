-- OSMS Seed Data
-- This file contains realistic seed data for the Order and Sales Management System
-- Based on the schemas in supabase/schemas/

-- Insert Projects
INSERT INTO projects (id, name, description, telegram_bot_token, payment_methods, is_active)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'Tech Store Myanmar', 'Electronics and gadgets retailer in Yangon', '6123456789:AAGExampleTokenForTechStoreMM', '{"cod": true, "kbz_pay": true, "aya_pay": true, "cb_pay": true}', true),
    ('550e8400-e29b-41d4-a716-446655440002', 'Fashion Boutique', 'Trendy clothing and accessories shop', '6987654321:AAGExampleTokenForFashionBoutique', '{"cod": true, "online": true, "mobile_banking": true}', true)
ON CONFLICT (id) DO NOTHING;

-- Insert User Roles
INSERT INTO user_roles (id, user_id, project_id, role, telegram_username, telegram_user_id, is_active)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440101', 'f21623c2-4a68-4a01-8a78-e681de9969ae', '550e8400-e29b-41d4-a716-446655440001', 'admin', 'admin_tech', 123456789, true),
    ('550e8400-e29b-41d4-a716-446655440102', 'f21623c2-4a68-4a01-8a78-e681de9969ae', '550e8400-e29b-41d4-a716-446655440002', 'admin', 'admin_fashion', 987654321, true)
ON CONFLICT (user_id, project_id) DO NOTHING;

-- Insert Categories
INSERT INTO categories (id, project_id, name, description, is_active)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'Smartphones', 'Mobile phones and accessories', true),
    ('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440001', 'Laptops', 'Portable computers and accessories', true),
    ('550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440001', 'Headphones', 'Audio devices and accessories', true),
    ('550e8400-e29b-41d4-a716-446655440204', '550e8400-e29b-41d4-a716-446655440002', 'T-Shirts', 'Casual and formal t-shirts', true),
    ('550e8400-e29b-41d4-a716-446655440205', '550e8400-e29b-41d4-a716-446655440002', 'Dresses', 'Women''s dresses collection', true)
ON CONFLICT (project_id, name) DO NOTHING;

-- Insert Items
INSERT INTO items (id, project_id, category_id, name, description, sku, stock_quantity, min_stock_level, weight, dimensions, is_active, is_featured, tags)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440201', 'iPhone 15 Pro', 'Latest Apple iPhone with A17 Pro chip', 'IPH15PRO-256', 25, 5, 0.19, '{"length": 14.7, "width": 7.1, "height": 0.8}', true, true, '{"smartphone", "apple", "5g"}'),
    ('550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440201', 'Samsung Galaxy S24', 'Samsung flagship with AI features', 'SGS24-512GB', 30, 8, 0.17, '{"length": 14.7, "width": 7.0, "height": 0.76}', true, true, '{"smartphone", "samsung", "android"}'),
    ('550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440202', 'MacBook Air M3', 'Apple laptop with M3 chip', 'MBA-M3-512GB', 15, 3, 1.24, '{"length": 30.4, "width": 21.5, "height": 1.13}', true, true, '{"laptop", "apple", "m3"}'),
    ('550e8400-e29b-41d4-a716-446655440304', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440203', 'Sony WH-1000XM5', 'Premium noise cancelling headphones', 'SONY-WH1000XM5', 20, 5, 0.25, '{"length": 25.4, "width": 22.0, "height": 8.9}', true, false, '{"headphones", "sony", "noise-cancelling"}'),
    ('550e8400-e29b-41d4-a716-446655440305', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440204', 'Cotton Basic Tee', 'Comfortable 100% cotton t-shirt', 'COTTON-TEE-M', 50, 10, 0.2, '{"length": 70, "width": 50, "height": 2}', true, false, '{"tshirt", "cotton", "casual"}'),
    ('550e8400-e29b-41d4-a716-446655440306', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440205', 'Summer Maxi Dress', 'Flowy summer dress for women', 'MAXI-DRESS-L', 35, 8, 0.3, '{"length": 120, "width": 45, "height": 3}', true, true, '{"dress", "summer", "maxi"}')
ON CONFLICT (project_id, sku) DO NOTHING;

-- Insert Item Prices
INSERT INTO item_prices (id, item_id, base_price, selling_price, discount_percentage, is_active, effective_from)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440301', 1299.00, 1199.00, 7.70, true, now()),
    ('550e8400-e29b-41d4-a716-446655440402', '550e8400-e29b-41d4-a716-446655440302', 899.00, 849.00, 5.56, true, now()),
    ('550e8400-e29b-41d4-a716-446655440403', '550e8400-e29b-41d4-a716-446655440303', 1599.00, 1499.00, 6.25, true, now()),
    ('550e8400-e29b-41d4-a716-446655440404', '550e8400-e29b-41d4-a716-446655440304', 399.00, 349.00, 12.53, true, now()),
    ('550e8400-e29b-41d4-a716-446655440405', '550e8400-e29b-41d4-a716-446655440305', 25.00, 22.00, 12.00, true, now()),
    ('550e8400-e29b-41d4-a716-446655440406', '550e8400-e29b-41d4-a716-446655440306', 89.00, 79.00, 11.24, true, now())
ON CONFLICT (id) DO NOTHING;

-- Insert Item Images
INSERT INTO item_images (id, item_id, image_url, alt_text, display_order, is_primary)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440501', '550e8400-e29b-41d4-a716-446655440301', 'https://example.com/images/iphone15pro-front.jpg', 'iPhone 15 Pro front view', 0, true),
    ('550e8400-e29b-41d4-a716-446655440502', '550e8400-e29b-41d4-a716-446655440301', 'https://example.com/images/iphone15pro-back.jpg', 'iPhone 15 Pro back view', 1, false),
    ('550e8400-e29b-41d4-a716-446655440503', '550e8400-e29b-41d4-a716-446655440302', 'https://example.com/images/galaxy-s24-front.jpg', 'Samsung Galaxy S24 front view', 0, true),
    ('550e8400-e29b-41d4-a716-446655440504', '550e8400-e29b-41d4-a716-446655440303', 'https://example.com/images/macbook-air-m3.jpg', 'MacBook Air M3 laptop', 0, true),
    ('550e8400-e29b-41d4-a716-446655440505', '550e8400-e29b-41d4-a716-446655440304', 'https://example.com/images/sony-wh1000xm5.jpg', 'Sony WH-1000XM5 headphones', 0, true),
    ('550e8400-e29b-41d4-a716-446655440506', '550e8400-e29b-41d4-a716-446655440305', 'https://example.com/images/cotton-tee.jpg', 'Cotton basic t-shirt', 0, true),
    ('550e8400-e29b-41d4-a716-446655440507', '550e8400-e29b-41d4-a716-446655440306', 'https://example.com/images/maxi-dress.jpg', 'Summer maxi dress', 0, true)
ON CONFLICT (id) DO NOTHING;

-- Insert Customers
INSERT INTO customers (id, project_id, telegram_user_id, telegram_username, first_name, last_name, phone, email, preferred_language, created_via, is_blocked)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440601', '550e8400-e29b-41d4-a716-446655440001', 111111111, 'john_tech', 'John', 'Smith', '+959123456789', 'john.smith@email.com', 'en', 'telegram', false),
    ('550e8400-e29b-41d4-a716-446655440602', '550e8400-e29b-41d4-a716-446655440001', 222222222, 'mary_buyer', 'Mary', 'Johnson', '+959987654321', 'mary.johnson@email.com', 'en', 'telegram', false),
    ('550e8400-e29b-41d4-a716-446655440603', '550e8400-e29b-41d4-a716-446655440002', 333333333, 'sarah_fashion', 'Sarah', 'Davis', '+959555666777', 'sarah.davis@email.com', 'en', 'manual', false),
    ('550e8400-e29b-41d4-a716-446655440604', '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, 'Michael', 'Brown', '+959444555666', 'michael.brown@email.com', 'en', 'manual', false)
ON CONFLICT (id) DO NOTHING;

-- Insert Customer Addresses
INSERT INTO customer_addresses (id, customer_id, label, address_line_1, address_line_2, city, state_region, postal_code, country, is_default)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440701', '550e8400-e29b-41d4-a716-446655440601', 'home', '123 Main Street', 'Apt 4B', 'Yangon', 'Yangon Region', '11111', 'Myanmar', true),
    ('550e8400-e29b-41d4-a716-446655440702', '550e8400-e29b-41d4-a716-446655440602', 'office', '456 Business Ave', 'Floor 12', 'Yangon', 'Yangon Region', '11222', 'Myanmar', true),
    ('550e8400-e29b-41d4-a716-446655440703', '550e8400-e29b-41d4-a716-446655440603', 'home', '789 Fashion Street', NULL, 'Mandalay', 'Mandalay Region', '05111', 'Myanmar', true),
    ('550e8400-e29b-41d4-a716-446655440704', '550e8400-e29b-41d4-a716-446655440604', 'home', '321 Tech Boulevard', 'Unit 5A', 'Yangon', 'Yangon Region', '11333', 'Myanmar', true)
ON CONFLICT (id) DO NOTHING;

-- Insert Orders
INSERT INTO orders (id, project_id, customer_id, order_number, status, payment_method, payment_status, telegram_user_id, subtotal, discount_amount, shipping_cost, tax_amount, total_amount, shipping_address, delivery_city, delivery_notes)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440801', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440601', 'ORD-2024-001', 'delivered', 'kbz_pay', 'paid', 111111111, 1199.00, 50.00, 15.00, 0.00, 1164.00, '{"address_line_1": "123 Main Street", "address_line_2": "Apt 4B", "city": "Yangon", "country": "Myanmar"}', 'Yangon', 'Please call before delivery'),
    ('550e8400-e29b-41d4-a716-446655440802', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440602', 'ORD-2024-002', 'confirmed', 'cod', 'pending', 222222222, 698.00, 0.00, 10.00, 0.00, 708.00, '{"address_line_1": "456 Business Ave", "address_line_2": "Floor 12", "city": "Yangon", "country": "Myanmar"}', 'Yangon', 'Office delivery between 9-5 PM'),
    ('550e8400-e29b-41d4-a716-446655440803', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440603', 'ORD-2024-003', 'pending', 'aya_pay', 'pending', 333333333, 158.00, 0.00, 25.00, 0.00, 183.00, '{"address_line_1": "789 Fashion Street", "city": "Mandalay", "country": "Myanmar"}', 'Mandalay', 'Handle with care - fashion items')
ON CONFLICT (project_id, order_number) DO NOTHING;

-- Insert Order Items
INSERT INTO order_items (id, order_id, item_id, quantity, unit_price, discount_amount, total_price, item_snapshot)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440901', '550e8400-e29b-41d4-a716-446655440801', '550e8400-e29b-41d4-a716-446655440301', 1, 1199.00, 50.00, 1149.00, '{"name": "iPhone 15 Pro", "sku": "IPH15PRO-256", "description": "Latest Apple iPhone with A17 Pro chip", "image_url": "https://example.com/images/iphone15pro-front.jpg"}'),
    ('550e8400-e29b-41d4-a716-446655440902', '550e8400-e29b-41d4-a716-446655440802', '550e8400-e29b-41d4-a716-446655440302', 1, 849.00, 0.00, 849.00, '{"name": "Samsung Galaxy S24", "sku": "SGS24-512GB", "description": "Samsung flagship with AI features", "image_url": "https://example.com/images/galaxy-s24-front.jpg"}'),
    ('550e8400-e29b-41d4-a716-446655440903', '550e8400-e29b-41d4-a716-446655440802', '550e8400-e29b-41d4-a716-446655440304', 1, 349.00, 0.00, 349.00, '{"name": "Sony WH-1000XM5", "sku": "SONY-WH1000XM5", "description": "Premium noise cancelling headphones", "image_url": "https://example.com/images/sony-wh1000xm5.jpg"}'),
    ('550e8400-e29b-41d4-a716-446655440904', '550e8400-e29b-41d4-a716-446655440803', '550e8400-e29b-41d4-a716-446655440306', 2, 79.00, 0.00, 158.00, '{"name": "Summer Maxi Dress", "sku": "MAXI-DRESS-L", "description": "Flowy summer dress for women", "image_url": "https://example.com/images/maxi-dress.jpg"}')
ON CONFLICT (id) DO NOTHING;

-- Insert Cart Items
INSERT INTO cart_items (id, customer_id, item_id, quantity)
VALUES 
    ('550e8400-e29b-41d4-a716-446655441001', '550e8400-e29b-41d4-a716-446655440601', '550e8400-e29b-41d4-a716-446655440303', 1),
    ('550e8400-e29b-41d4-a716-446655441002', '550e8400-e29b-41d4-a716-446655440602', '550e8400-e29b-41d4-a716-446655440305', 3)
ON CONFLICT (customer_id, item_id) DO NOTHING;

-- Insert Payment QR Codes
INSERT INTO payment_qr_codes (id, project_id, payment_method, phone_number, qr_code_url, is_active)
VALUES 
    ('550e8400-e29b-41d4-a716-446655441101', '550e8400-e29b-41d4-a716-446655440001', 'kbz_pay', '09123456789', 'https://example.com/qr/kbz_pay_tech_store.png', true),
    ('550e8400-e29b-41d4-a716-446655441102', '550e8400-e29b-41d4-a716-446655440001', 'aya_pay', '09123456789', 'https://example.com/qr/aya_pay_tech_store.png', true),
    ('550e8400-e29b-41d4-a716-446655441103', '550e8400-e29b-41d4-a716-446655440002', 'cb_pay', '09987654321', 'https://example.com/qr/cb_pay_fashion.png', true)
ON CONFLICT (project_id, payment_method) DO NOTHING;

-- Insert Stock Movements
INSERT INTO stock_movements (id, item_id, movement_type, reason, quantity, reference_id, reference_type, notes, created_by)
VALUES 
    ('550e8400-e29b-41d4-a716-446655441201', '550e8400-e29b-41d4-a716-446655440301', 'in', 'initial', 30, NULL, 'initial_stock', 'Initial stock setup', 'f21623c2-4a68-4a01-8a78-e681de9969ae'),
    ('550e8400-e29b-41d4-a716-446655441202', '550e8400-e29b-41d4-a716-446655440301', 'out', 'sale', 1, '550e8400-e29b-41d4-a716-446655440801', 'order', 'Sold via order ORD-2024-001', 'f21623c2-4a68-4a01-8a78-e681de9969ae'),
    ('550e8400-e29b-41d4-a716-446655441203', '550e8400-e29b-41d4-a716-446655440302', 'in', 'initial', 35, NULL, 'initial_stock', 'Initial stock setup', 'f21623c2-4a68-4a01-8a78-e681de9969ae'),
    ('550e8400-e29b-41d4-a716-446655441204', '550e8400-e29b-41d4-a716-446655440306', 'in', 'initial', 40, NULL, 'initial_stock', 'Initial stock setup for fashion items', 'f21623c2-4a68-4a01-8a78-e681de9969ae')
ON CONFLICT (id) DO NOTHING;

-- Insert Chat Messages (sample conversation)
INSERT INTO chat_messages (id, project_id, customer_id, telegram_message_id, message_type, direction, content, is_auto_reply)
VALUES 
    ('550e8400-e29b-41d4-a716-446655441301', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440601', 1001, 'text', 'inbound', 'Hi, I want to buy iPhone 15 Pro', false),
    ('550e8400-e29b-41d4-a716-446655441302', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440601', 1002, 'text', 'outbound', 'Hello! iPhone 15 Pro is available for $1199. Would you like to place an order?', false),
    ('550e8400-e29b-41d4-a716-446655441303', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440601', 1003, 'text', 'inbound', 'Yes, please create order for me', false),
    ('550e8400-e29b-41d4-a716-446655441304', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440601', 1004, 'text', 'outbound', 'Great! I''ve created order ORD-2024-001 for you. Total is $1164 including shipping.', false)
ON CONFLICT (id) DO NOTHING;

-- Update order timestamps for delivered order
UPDATE orders SET 
    confirmed_at = now() - interval '2 days',
    delivered_at = now() - interval '1 day',
    paid_at = now() - interval '1 day'
WHERE id = '550e8400-e29b-41d4-a716-446655440801';

-- Update order timestamps for confirmed order  
UPDATE orders SET 
    confirmed_at = now() - interval '1 day'
WHERE id = '550e8400-e29b-41d4-a716-446655440802';
