-- Projects table - main organizational unit for multi-tenant system
-- File: 01_projects.sql

create table projects (
    id uuid primary key default gen_random_uuid(),
    name varchar(255) not null,
    description text,
    telegram_bot_token varchar(255) unique,
    telegram_webhook_url varchar(500),
    payment_methods jsonb default '{}',
    is_active boolean default true,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Indexes
create index idx_projects_active on projects(is_active);

-- Row Level Security (enabled here, policies added later in 80_rls_policies.sql)
alter table projects enable row level security;

comment on table projects is 'Main organizational unit for the multi-tenant system. Each project represents a separate business or shop.';
