-- Items table - main product/item management
-- File: 04_items.sql

create table items (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references projects(id) on delete cascade,
    category_id uuid references categories(id) on delete set null,
    name varchar(255) not null,
    description text,
    sku varchar(100),
    stock_quantity integer not null default 0 check (stock_quantity >= 0),
    min_stock_level integer default 0,
    weight decimal(8, 2), -- for shipping calculations
    dimensions jsonb, -- {"length": 10, "width": 5, "height": 2}
    is_active boolean default true,
    is_featured boolean default false,
    tags text[],
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    
    unique(project_id, sku)
);

-- Indexes
create index idx_items_project on items(project_id);
create index idx_items_category on items(category_id);
create index idx_items_active on items(project_id, is_active);
create index idx_items_featured on items(project_id, is_featured);
create index idx_items_stock on items(project_id, stock_quantity);
create index idx_items_tags on items using gin(tags);

-- Row Level Security (enabled here, policies added later in 80_rls_policies.sql)
alter table items enable row level security;

comment on table items is 'Products and items that can be sold within each project.';
