drop trigger if exists "update_stock_on_order_confirm" on "public"."orders";

drop function if exists "public"."update_item_stock"();

drop view if exists "public"."order_summary";

drop view if exists "public"."popular_items";

alter table "public"."health_checks" disable row level security;

create or replace view "public"."order_summary" as  SELECT o.id,
    o.project_id,
    o.customer_id,
    o.order_number,
    o.status,
    o.payment_method,
    o.payment_status,
    o.payment_reference,
    o.telegram_user_id,
    o.telegram_message_id,
    o.subtotal,
    o.discount_amount,
    o.shipping_cost,
    o.tax_amount,
    o.total_amount,
    o.shipping_address,
    o.delivery_city,
    o.customer_phone_secondary,
    o.delivery_notes,
    o.tracking_number,
    o.notes,
    o.internal_notes,
    o.created_at,
    o.updated_at,
    o.confirmed_at,
    o.delivered_at,
    o.paid_at,
    c.first_name,
    c.last_name,
    c.phone,
    count(oi.id) AS item_count,
    COALESCE(sum(oi.quantity), (0)::bigint) AS total_quantity
   FROM ((orders o
     LEFT JOIN customers c ON ((o.customer_id = c.id)))
     LEFT JOIN order_items oi ON ((o.id = oi.order_id)))
  GROUP BY o.id, c.first_name, c.last_name, c.phone;


create or replace view "public"."popular_items" as  SELECT i.id,
    i.project_id,
    i.category_id,
    i.name,
    i.description,
    i.sku,
    i.stock_quantity,
    i.min_stock_level,
    i.weight,
    i.dimensions,
    i.is_active,
    i.is_featured,
    i.tags,
    i.created_at,
    i.updated_at,
    COALESCE(sum(oi.quantity), (0)::bigint) AS total_sold,
    count(DISTINCT oi.order_id) AS order_count
   FROM ((items i
     LEFT JOIN order_items oi ON ((i.id = oi.item_id)))
     LEFT JOIN orders o ON (((oi.order_id = o.id) AND (o.status = ANY (ARRAY['delivered'::order_status_enum, 'done'::order_status_enum])))))
  GROUP BY i.id;



