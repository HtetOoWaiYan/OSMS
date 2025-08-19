-- Database views for common queries
-- File: 91_views.sql

-- Items with current prices view
create view items_with_current_prices as
select 
    i.*,
    ip.base_price,
    ip.selling_price,
    ip.discount_percentage,
    ip.effective_from as price_effective_from
from items i
left join item_prices ip on i.id = ip.item_id 
    and ip.is_active = true 
    and ip.effective_from <= now() 
    and (ip.effective_until is null or ip.effective_until > now());

-- Order summary view
create view order_summary as
select 
    o.*,
    c.first_name,
    c.last_name,
    c.phone,
    count(oi.id) as item_count,
    coalesce(sum(oi.quantity), 0) as total_quantity
from orders o
left join customers c on o.customer_id = c.id
left join order_items oi on o.id = oi.order_id
group by o.id, c.first_name, c.last_name, c.phone;

-- Popular items view
create view popular_items as
select 
    i.*,
    coalesce(sum(oi.quantity), 0) as total_sold,
    count(distinct oi.order_id) as order_count
from items i
left join order_items oi on i.id = oi.item_id
left join orders o on oi.order_id = o.id and o.status in ('delivered', 'done')
group by i.id;
