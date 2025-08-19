-- Item prices table - manages pricing history and current prices
-- File: 05_item_prices.sql

-- Enable the btree_gist extension for UUID support in GIST indexes
create extension if not exists btree_gist;

create table item_prices (
    id uuid primary key default gen_random_uuid(),
    item_id uuid not null references items(id) on delete cascade,
    base_price decimal(12, 2) not null check (base_price >= 0),
    selling_price decimal(12, 2) not null check (selling_price >= 0),
    discount_percentage decimal(5, 2) default 0 check (discount_percentage >= 0 and discount_percentage <= 100),
    is_active boolean default true,
    effective_from timestamp with time zone default now(),
    effective_until timestamp with time zone,
    created_at timestamp with time zone default now(),
    
    -- Ensure only one active price per item at any time
    exclude using gist (
        item_id with =,
        tstzrange(effective_from, coalesce(effective_until, 'infinity'::timestamptz)) with &&
    ) where (is_active = true)
);

-- Indexes
create index idx_item_prices_item on item_prices(item_id);
create index idx_item_prices_active on item_prices(item_id, is_active, effective_from);
create index idx_item_prices_effective on item_prices(effective_from, effective_until);

-- Row Level Security (enabled here, policies added later in 80_rls_policies.sql)
alter table item_prices enable row level security;

comment on table item_prices is 'Price history and current pricing for items with effective date ranges.';
