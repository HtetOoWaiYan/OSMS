-- Payment QR codes table - manages QR code storage for payment methods
-- File: 15_payment_qr_codes.sql

create table payment_qr_codes (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references projects(id) on delete cascade,
    payment_method varchar(50) not null, -- 'kbz_pay', 'cb_pay', 'aya_pay'
    phone_number varchar(20) not null,
    qr_code_url text,
    is_active boolean default true,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    
    unique(project_id, payment_method)
);

-- Indexes
create index idx_payment_qr_codes_project on payment_qr_codes(project_id);
create index idx_payment_qr_codes_method on payment_qr_codes(project_id, payment_method);

-- Row Level Security (enabled here, policies added later in 80_rls_policies.sql)
alter table payment_qr_codes enable row level security;

comment on table payment_qr_codes is 'Stores QR code information for payment methods within each project.';