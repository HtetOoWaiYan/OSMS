-- Cart items table - manages shopping cart for Telegram mini app
-- File: 12_cart_items.sql

create table cart_items (
    id uuid primary key default gen_random_uuid(),
    customer_id uuid not null references customers(id) on delete cascade,
    item_id uuid not null references items(id) on delete cascade,
    quantity integer not null check (quantity > 0),
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    
    unique(customer_id, item_id)
);

-- Indexes
create index idx_cart_items_customer on cart_items(customer_id);

-- Row Level Security (enabled here, policies added later in 80_rls_policies.sql)
alter table cart_items enable row level security;

comment on table cart_items is 'Shopping cart items for Telegram mini app customers.';
