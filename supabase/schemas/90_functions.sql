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

create trigger update_item_prices_updated_at 
    before update on item_prices 
    for each row 
    execute function update_updated_at_column();

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

-- Function to update item stock when orders are confirmed
create or replace function update_item_stock()
returns trigger as $$
begin
    if new.status = 'confirmed' and old.status != 'confirmed' then
        -- Decrease stock when order is confirmed
        update items 
        set stock_quantity = stock_quantity - oi.quantity
        from order_items oi
        where oi.order_id = new.id and items.id = oi.item_id;
        
        -- Record stock movements
        insert into stock_movements (item_id, movement_type, reason, quantity, reference_id, reference_type)
        select oi.item_id, 'out', 'sale', oi.quantity, new.id, 'order'
        from order_items oi
        where oi.order_id = new.id;
    end if;
    
    return new;
end;
$$ language 'plpgsql';

-- Trigger to update stock on order confirmation
create trigger update_stock_on_order_confirm 
    after update on orders 
    for each row 
    execute function update_item_stock();
