-- Order items table - manages items within orders
-- File: 10_order_items.sql

create table order_items (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null references orders(id) on delete cascade,
    item_id uuid not null references items(id),
    quantity integer not null check (quantity > 0),
    unit_price decimal(12, 2) not null check (unit_price >= 0),
    discount_amount decimal(12, 2) default 0 check (discount_amount >= 0),
    total_price decimal(12, 2) not null check (total_price >= 0),
    
    -- Snapshot of item data at time of order
    item_snapshot jsonb not null, -- {"name", "sku", "description", "image_url"}
    
    created_at timestamp with time zone default now()
);

-- Indexes
create index idx_order_items_order on order_items(order_id);
create index idx_order_items_item on order_items(item_id);

-- Row Level Security (enabled here, policies added later in 80_rls_policies.sql)
alter table order_items enable row level security;

comment on table order_items is 'Individual items within orders with historical snapshots.';
