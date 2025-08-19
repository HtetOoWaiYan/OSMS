-- Stock movements table - tracks inventory changes
-- File: 14_stock_movements.sql

create table stock_movements (
    id uuid primary key default gen_random_uuid(),
    item_id uuid not null references items(id) on delete cascade,
    movement_type stock_movement_type_enum not null,
    reason stock_movement_reason_enum not null,
    quantity integer not null,
    reference_id uuid, -- Could be order_id or other reference
    reference_type varchar(50), -- 'order', 'adjustment', etc.
    notes text,
    created_by uuid references auth.users(id),
    created_at timestamp with time zone default now()
);

-- Indexes
create index idx_stock_movements_item on stock_movements(item_id);
create index idx_stock_movements_created on stock_movements(created_at desc);

-- Row Level Security (enabled here, policies added later in 80_rls_policies.sql)
alter table stock_movements enable row level security;

comment on table stock_movements is 'Tracks all inventory movements and changes for audit and reporting.';
