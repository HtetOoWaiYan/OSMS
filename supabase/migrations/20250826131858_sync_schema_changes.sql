drop policy "Allow authenticated users to delete item images" on "public"."item_images";

drop policy "Allow authenticated users to insert item images" on "public"."item_images";

drop policy "Allow authenticated users to update item images" on "public"."item_images";

drop policy "Service role full access to item_images" on "public"."item_images";

alter table "public"."customers" drop constraint "customers_telegram_user_id_key";

drop view if exists "public"."items_with_current_prices";

drop view if exists "public"."order_summary";

drop view if exists "public"."popular_items";

drop index if exists "public"."customers_telegram_user_id_key";


  create table "public"."payment_qr_codes" (
    "id" uuid not null default gen_random_uuid(),
    "project_id" uuid not null,
    "payment_method" character varying(50) not null,
    "phone_number" character varying(20) not null,
    "qr_code_url" text,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."payment_qr_codes" enable row level security;

alter table "public"."customers" add column "created_via" text default 'manual'::text;

alter table "public"."item_prices" drop column "updated_at";

alter table "public"."orders" add column "customer_phone_secondary" character varying(20);

alter table "public"."orders" add column "delivery_city" character varying(100);

alter table "public"."orders" add column "payment_reference" character varying(255);

alter table "public"."orders" add column "telegram_user_id" bigint;

alter table "public"."user_roles" add column "telegram_user_id" bigint;

alter table "public"."user_roles" add column "telegram_username" character varying(255);

CREATE UNIQUE INDEX customers_project_id_telegram_user_id_key ON public.customers USING btree (project_id, telegram_user_id);

CREATE INDEX idx_orders_telegram_user ON public.orders USING btree (telegram_user_id);

CREATE INDEX idx_payment_qr_codes_method ON public.payment_qr_codes USING btree (project_id, payment_method);

CREATE INDEX idx_payment_qr_codes_project ON public.payment_qr_codes USING btree (project_id);

CREATE UNIQUE INDEX payment_qr_codes_pkey ON public.payment_qr_codes USING btree (id);

CREATE UNIQUE INDEX payment_qr_codes_project_id_payment_method_key ON public.payment_qr_codes USING btree (project_id, payment_method);

alter table "public"."payment_qr_codes" add constraint "payment_qr_codes_pkey" PRIMARY KEY using index "payment_qr_codes_pkey";

alter table "public"."customers" add constraint "customers_created_via_check" CHECK ((created_via = ANY (ARRAY['manual'::text, 'telegram'::text]))) not valid;

alter table "public"."customers" validate constraint "customers_created_via_check";

alter table "public"."customers" add constraint "customers_project_id_telegram_user_id_key" UNIQUE using index "customers_project_id_telegram_user_id_key";

alter table "public"."payment_qr_codes" add constraint "payment_qr_codes_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE not valid;

alter table "public"."payment_qr_codes" validate constraint "payment_qr_codes_project_id_fkey";

alter table "public"."payment_qr_codes" add constraint "payment_qr_codes_project_id_payment_method_key" UNIQUE using index "payment_qr_codes_project_id_payment_method_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_customer_from_telegram(p_project_id uuid, p_telegram_id bigint, p_telegram_username character varying DEFAULT NULL::character varying, p_first_name character varying DEFAULT NULL::character varying, p_last_name character varying DEFAULT NULL::character varying)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
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
$function$
;

create or replace view "public"."items_with_current_prices" as  SELECT i.id,
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
    ip.base_price,
    ip.selling_price,
    ip.discount_percentage,
    ip.effective_from AS price_effective_from
   FROM (items i
     LEFT JOIN item_prices ip ON (((i.id = ip.item_id) AND (ip.is_active = true) AND (ip.effective_from <= now()) AND ((ip.effective_until IS NULL) OR (ip.effective_until > now())))));


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


grant delete on table "public"."payment_qr_codes" to "anon";

grant insert on table "public"."payment_qr_codes" to "anon";

grant references on table "public"."payment_qr_codes" to "anon";

grant select on table "public"."payment_qr_codes" to "anon";

grant trigger on table "public"."payment_qr_codes" to "anon";

grant truncate on table "public"."payment_qr_codes" to "anon";

grant update on table "public"."payment_qr_codes" to "anon";

grant delete on table "public"."payment_qr_codes" to "authenticated";

grant insert on table "public"."payment_qr_codes" to "authenticated";

grant references on table "public"."payment_qr_codes" to "authenticated";

grant select on table "public"."payment_qr_codes" to "authenticated";

grant trigger on table "public"."payment_qr_codes" to "authenticated";

grant truncate on table "public"."payment_qr_codes" to "authenticated";

grant update on table "public"."payment_qr_codes" to "authenticated";

grant delete on table "public"."payment_qr_codes" to "service_role";

grant insert on table "public"."payment_qr_codes" to "service_role";

grant references on table "public"."payment_qr_codes" to "service_role";

grant select on table "public"."payment_qr_codes" to "service_role";

grant trigger on table "public"."payment_qr_codes" to "service_role";

grant truncate on table "public"."payment_qr_codes" to "service_role";

grant update on table "public"."payment_qr_codes" to "service_role";

CREATE TRIGGER update_payment_qr_codes_updated_at BEFORE UPDATE ON public.payment_qr_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

drop policy "Authenticated users can delete item images" on "storage"."objects";

drop policy "Authenticated users can upload item images" on "storage"."objects";

drop policy "Authenticated users can view item images" on "storage"."objects";

drop policy "Public read access to item images" on "storage"."objects";


