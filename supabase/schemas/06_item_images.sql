-- Item images table - manages product images
-- File: 06_item_images.sql

create table item_images (
    id uuid primary key default gen_random_uuid(),
    item_id uuid not null references items(id) on delete cascade,
    image_url varchar(500) not null,
    alt_text varchar(255),
    display_order integer default 0,
    is_primary boolean default false,
    created_at timestamp with time zone default now()
);

-- Indexes
create index idx_item_images_item on item_images(item_id);
create index idx_item_images_primary on item_images(item_id, is_primary);

-- Row Level Security (enabled here, policies added later in 80_rls_policies.sql)
alter table item_images enable row level security;

comment on table item_images is 'Image storage and management for product items.';
