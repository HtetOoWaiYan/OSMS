-- Invoices table - manages invoicing for orders
-- File: 11_invoices.sql

create table invoices (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references projects(id) on delete cascade,
    order_id uuid unique not null references orders(id),
    invoice_number varchar(50) not null,
    status invoice_status_enum default 'draft',
    
    -- Invoice details
    issued_date date not null default current_date,
    due_date date,
    paid_date date,
    
    -- Amounts
    subtotal decimal(12, 2) not null,
    tax_amount decimal(12, 2) default 0,
    total_amount decimal(12, 2) not null,
    
    notes text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    
    unique(project_id, invoice_number)
);

-- Indexes
create index idx_invoices_project on invoices(project_id);
create index idx_invoices_status on invoices(project_id, status);
create index idx_invoices_due_date on invoices(project_id, due_date);

-- Row Level Security (enabled here, policies added later in 80_rls_policies.sql)
alter table invoices enable row level security;

comment on table invoices is 'Invoice management for orders with payment tracking.';
