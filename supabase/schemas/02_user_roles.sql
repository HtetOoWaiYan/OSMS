-- User roles table - manages multi-tenant access control
-- File: 02_user_roles.sql

create table user_roles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    project_id uuid not null references projects(id) on delete cascade,
    role user_role_enum not null default 'agent',
    permissions jsonb default '{}',
    is_active boolean default true,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    
    unique(user_id, project_id)
);

-- Indexes
create index idx_user_roles_user_project on user_roles(user_id, project_id);
create index idx_user_roles_project on user_roles(project_id);

-- Row Level Security (enabled here, policies added later in 80_rls_policies.sql)
alter table user_roles enable row level security;

comment on table user_roles is 'Manages user access and roles within projects for multi-tenant system.';
