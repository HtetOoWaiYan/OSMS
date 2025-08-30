-- Health checks table - for system monitoring and periodic health verification
-- File: 16_health_checks.sql

create table health_checks (
    id uuid primary key default gen_random_uuid(),
    component health_check_component_enum not null,
    status health_check_status_enum not null default 'unknown',
    message text,
    response_time_ms integer,
    details jsonb default '{}',
    checked_at timestamp with time zone default now(),
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Indexes for efficient querying
create index idx_health_checks_component on health_checks(component);
create index idx_health_checks_status on health_checks(status);
create index idx_health_checks_checked_at on health_checks(checked_at);
create index idx_health_checks_component_checked_at on health_checks(component, checked_at desc);

comment on table health_checks is 'System health monitoring table for tracking periodic health checks of various components';
comment on column health_checks.component is 'The system component being checked (database, api, storage, etc.)';
comment on column health_checks.status is 'Current health status of the component';
comment on column health_checks.message is 'Human-readable status message or error description';
comment on column health_checks.response_time_ms is 'Response time in milliseconds for performance monitoring';
comment on column health_checks.details is 'Additional details about the health check in JSON format';
comment on column health_checks.checked_at is 'When this specific health check was performed';