-- Database functions and triggers
-- File: 90_functions.sql

-- Function to update the updated_at column
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

-- Apply update timestamp trigger to relevant tables
create trigger update_projects_updated_at 
    before update on projects 
    for each row 
    execute function update_updated_at_column();

create trigger update_user_roles_updated_at 
    before update on user_roles 
    for each row 
    execute function update_updated_at_column();

create trigger update_categories_updated_at 
    before update on categories 
    for each row 
    execute function update_updated_at_column();

create trigger update_items_updated_at 
    before update on items 
    for each row 
    execute function update_updated_at_column();

create trigger update_customers_updated_at 
    before update on customers 
    for each row 
    execute function update_updated_at_column();

create trigger update_orders_updated_at 
    before update on orders 
    for each row 
    execute function update_updated_at_column();

create trigger update_invoices_updated_at 
    before update on invoices 
    for each row 
    execute function update_updated_at_column();

-- Item prices don't need updated_at trigger as they use effective_from/effective_until
-- for versioning and price changes create new records rather than updating existing ones

create trigger update_customer_addresses_updated_at 
    before update on customer_addresses 
    for each row 
    execute function update_updated_at_column();

create trigger update_cart_items_updated_at 
    before update on cart_items 
    for each row 
    execute function update_updated_at_column();

create trigger update_payment_qr_codes_updated_at 
    before update on payment_qr_codes 
    for each row 
    execute function update_updated_at_column();

create trigger update_health_checks_updated_at 
    before update on health_checks 
    for each row 
    execute function update_updated_at_column();

-- Function to create customer from Telegram user data
create or replace function create_customer_from_telegram(
  p_project_id uuid,
  p_telegram_id bigint,
  p_telegram_username varchar default null,
  p_first_name varchar default null,
  p_last_name varchar default null
) returns uuid as $$
declare
  customer_id uuid;
begin
  insert into customers (
    project_id,
    telegram_user_id,
    telegram_username,
    first_name,
    last_name,
    created_via
  ) values (
    p_project_id,
    p_telegram_id,
    p_telegram_username,
    coalesce(p_first_name, 'Telegram User'),
    p_last_name,
    'telegram'
  )
  on conflict (project_id, telegram_user_id) 
  do update set 
    telegram_username = excluded.telegram_username,
    first_name = coalesce(excluded.first_name, customers.first_name),
    last_name = coalesce(excluded.last_name, customers.last_name)
  returning id into customer_id;
  
  return customer_id;
end;
$$ language plpgsql;

-- Function to record health check results
create or replace function record_health_check(
  p_component health_check_component_enum,
  p_status health_check_status_enum,
  p_message text default null,
  p_response_time_ms integer default null,
  p_details jsonb default '{}'
) returns uuid as $$
declare
  health_check_id uuid;
begin
  insert into health_checks (
    component,
    status,
    message,
    response_time_ms,
    details,
    checked_at
  ) values (
    p_component,
    p_status,
    p_message,
    p_response_time_ms,
    p_details,
    now()
  )
  returning id into health_check_id;
  
  return health_check_id;
end;
$$ language plpgsql;
