-- Categories table - organizes items into categories
-- File: 03_categories.sql

create table categories (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references projects(id) on delete cascade,
    name varchar(255) not null,
    description text,
    is_active boolean default true,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    
    unique(project_id, name)
);

-- Indexes
create index idx_categories_project on categories(project_id);
create index idx_categories_active on categories(project_id, is_active);

-- Row Level Security (enabled here, policies added later in 80_rls_policies.sql)
alter table categories enable row level security;

comment on table categories is 'Product categories for organizing items within each project.';
