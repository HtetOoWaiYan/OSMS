create type "public"."health_check_component_enum" as enum ('database', 'api', 'storage', 'telegram_bot', 'external_service');

create type "public"."health_check_status_enum" as enum ('healthy', 'warning', 'critical', 'unknown');

drop view if exists "public"."order_summary";

drop view if exists "public"."popular_items";


  create table "public"."health_checks" (
    "id" uuid not null default gen_random_uuid(),
    "component" health_check_component_enum not null,
    "status" health_check_status_enum not null default 'unknown'::health_check_status_enum,
    "message" text,
    "response_time_ms" integer,
    "details" jsonb default '{}'::jsonb,
    "checked_at" timestamp with time zone default now(),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


CREATE UNIQUE INDEX health_checks_pkey ON public.health_checks USING btree (id);

CREATE INDEX idx_health_checks_checked_at ON public.health_checks USING btree (checked_at);

CREATE INDEX idx_health_checks_component ON public.health_checks USING btree (component);

CREATE INDEX idx_health_checks_component_checked_at ON public.health_checks USING btree (component, checked_at DESC);

CREATE INDEX idx_health_checks_status ON public.health_checks USING btree (status);

alter table "public"."health_checks" add constraint "health_checks_pkey" PRIMARY KEY using index "health_checks_pkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.record_health_check(p_component health_check_component_enum, p_status health_check_status_enum, p_message text DEFAULT NULL::text, p_response_time_ms integer DEFAULT NULL::integer, p_details jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
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
$function$
;

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


grant delete on table "public"."health_checks" to "anon";

grant insert on table "public"."health_checks" to "anon";

grant references on table "public"."health_checks" to "anon";

grant select on table "public"."health_checks" to "anon";

grant trigger on table "public"."health_checks" to "anon";

grant truncate on table "public"."health_checks" to "anon";

grant update on table "public"."health_checks" to "anon";

grant delete on table "public"."health_checks" to "authenticated";

grant insert on table "public"."health_checks" to "authenticated";

grant references on table "public"."health_checks" to "authenticated";

grant select on table "public"."health_checks" to "authenticated";

grant trigger on table "public"."health_checks" to "authenticated";

grant truncate on table "public"."health_checks" to "authenticated";

grant update on table "public"."health_checks" to "authenticated";

grant delete on table "public"."health_checks" to "service_role";

grant insert on table "public"."health_checks" to "service_role";

grant references on table "public"."health_checks" to "service_role";

grant select on table "public"."health_checks" to "service_role";

grant trigger on table "public"."health_checks" to "service_role";

grant truncate on table "public"."health_checks" to "service_role";

grant update on table "public"."health_checks" to "service_role";


  create policy "Users can view payment QR codes in their projects"
  on "public"."payment_qr_codes"
  as permissive
  for select
  to authenticated
using ((project_id IN ( SELECT user_roles.project_id
   FROM user_roles
  WHERE ((user_roles.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles.is_active = true)))));


CREATE TRIGGER update_health_checks_updated_at BEFORE UPDATE ON public.health_checks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


