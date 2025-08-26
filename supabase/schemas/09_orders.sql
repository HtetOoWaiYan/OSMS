-- Orders table - manages customer orders
-- File: 09_orders.sql

create table orders (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references projects(id) on delete cascade,
    customer_id uuid not null references customers(id),
    order_number varchar(50) not null,
    status order_status_enum default 'pending',
    payment_method payment_method_enum not null,
    payment_status payment_status_enum default 'pending',
    payment_reference varchar(255), -- For transaction tracking
    
    -- Telegram Integration
    telegram_user_id bigint,
    telegram_message_id bigint,
    
    -- Pricing
    subtotal decimal(12, 2) not null check (subtotal >= 0),
    discount_amount decimal(12, 2) default 0 check (discount_amount >= 0),
    shipping_cost decimal(12, 2) default 0 check (shipping_cost >= 0),
    tax_amount decimal(12, 2) default 0 check (tax_amount >= 0),
    total_amount decimal(12, 2) not null check (total_amount >= 0),
    
    -- Shipping Info
    shipping_address jsonb not null, -- Denormalized for order history
    delivery_city varchar(100),
    customer_phone_secondary varchar(20), -- Optional secondary phone
    delivery_notes text,
    tracking_number varchar(100),
    
    -- Metadata
    notes text,
    internal_notes text, -- Only visible to admin/agents
    
    -- Timestamps
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    confirmed_at timestamp with time zone,
    delivered_at timestamp with time zone,
    paid_at timestamp with time zone,
    
    unique(project_id, order_number)
);

-- Indexes
create index idx_orders_project on orders(project_id);
create index idx_orders_customer on orders(customer_id);
create index idx_orders_telegram_user on orders(telegram_user_id);
create index idx_orders_status on orders(project_id, status);
create index idx_orders_payment_status on orders(project_id, payment_status);
create index idx_orders_created on orders(project_id, created_at desc);
create index idx_orders_number on orders(project_id, order_number);

-- Row Level Security (enabled here, policies added later in 80_rls_policies.sql)
alter table orders enable row level security;

comment on table orders is 'Customer orders with complete order lifecycle management.';
