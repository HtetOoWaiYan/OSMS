-- Customers table - manages customer information
-- File: 07_customers.sql

create table customers (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references projects(id) on delete cascade,
    telegram_user_id bigint unique,
    telegram_username varchar(100),
    first_name varchar(100),
    last_name varchar(100),
    phone varchar(20),
    email varchar(255),
    preferred_language varchar(10) default 'en',
    is_blocked boolean default false,
    notes text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Indexes
create index idx_customers_project on customers(project_id);
create index idx_customers_telegram on customers(telegram_user_id);
create index idx_customers_phone on customers(project_id, phone);

-- Row Level Security (enabled here, policies added later in 80_rls_policies.sql)
alter table customers enable row level security;

comment on table customers is 'Customer information for each project, supporting both Telegram and traditional customers.';
