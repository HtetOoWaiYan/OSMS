-- Customer addresses table - manages customer delivery addresses
-- File: 08_customer_addresses.sql

create table customer_addresses (
    id uuid primary key default gen_random_uuid(),
    customer_id uuid not null references customers(id) on delete cascade,
    label varchar(50), -- 'home', 'office', etc.
    address_line_1 varchar(255) not null,
    address_line_2 varchar(255),
    city varchar(100) not null,
    state_region varchar(100),
    postal_code varchar(20), -- Made optional
    country varchar(100) default 'Myanmar',
    is_default boolean default false,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Indexes
create index idx_customer_addresses_customer on customer_addresses(customer_id);

-- Row Level Security (enabled here, policies added later in 80_rls_policies.sql)
alter table customer_addresses enable row level security;

comment on table customer_addresses is 'Delivery addresses for customers within each project.';
