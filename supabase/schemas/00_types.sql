-- Base enum types used across multiple tables
-- File: 00_types.sql

-- User role types
create type user_role_enum as enum ('admin', 'agent');

-- Order status types
create type order_status_enum as enum ('pending', 'confirmed', 'delivering', 'delivered', 'paid', 'done', 'cancelled');

-- Payment method types
create type payment_method_enum as enum ('cod', 'online', 'kbz_pay', 'aya_pay', 'cb_pay', 'mobile_banking');

-- Payment status types
create type payment_status_enum as enum ('pending', 'paid', 'failed', 'refunded');

-- Invoice status types
create type invoice_status_enum as enum ('draft', 'sent', 'paid', 'overdue', 'cancelled');

-- Message types for chat
create type message_type_enum as enum ('text', 'image', 'document', 'location', 'contact');
create type message_direction_enum as enum ('inbound', 'outbound');

-- Stock movement types
create type stock_movement_type_enum as enum ('in', 'out', 'adjustment');
create type stock_movement_reason_enum as enum ('purchase', 'sale', 'return', 'damaged', 'adjustment', 'initial');

-- Health check types
create type health_check_status_enum as enum ('healthy', 'warning', 'critical', 'unknown');
create type health_check_component_enum as enum ('database', 'api', 'storage', 'telegram_bot', 'external_service');
