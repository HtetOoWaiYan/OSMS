create extension if not exists "btree_gist" with schema "public";

create type "public"."invoice_status_enum" as enum ('draft', 'sent', 'paid', 'overdue', 'cancelled');

create type "public"."message_direction_enum" as enum ('inbound', 'outbound');

create type "public"."message_type_enum" as enum ('text', 'image', 'document', 'location', 'contact');

create type "public"."order_status_enum" as enum ('pending', 'confirmed', 'delivering', 'delivered', 'paid', 'done', 'cancelled');

create type "public"."payment_method_enum" as enum ('cod', 'online', 'kbz_pay', 'aya_pay', 'cb_pay', 'mobile_banking');

create type "public"."payment_status_enum" as enum ('pending', 'paid', 'failed', 'refunded');

create type "public"."stock_movement_reason_enum" as enum ('purchase', 'sale', 'return', 'damaged', 'adjustment', 'initial');

create type "public"."stock_movement_type_enum" as enum ('in', 'out', 'adjustment');

create type "public"."user_role_enum" as enum ('admin', 'agent');


  create table "public"."cart_items" (
    "id" uuid not null default gen_random_uuid(),
    "customer_id" uuid not null,
    "item_id" uuid not null,
    "quantity" integer not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."cart_items" enable row level security;


  create table "public"."categories" (
    "id" uuid not null default gen_random_uuid(),
    "project_id" uuid not null,
    "name" character varying(255) not null,
    "description" text,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."categories" enable row level security;


  create table "public"."chat_messages" (
    "id" uuid not null default gen_random_uuid(),
    "project_id" uuid not null,
    "customer_id" uuid not null,
    "telegram_message_id" bigint,
    "message_type" message_type_enum default 'text'::message_type_enum,
    "direction" message_direction_enum not null,
    "content" text,
    "media_url" character varying(500),
    "is_auto_reply" boolean default false,
    "reply_to_message_id" uuid,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."chat_messages" enable row level security;


  create table "public"."customer_addresses" (
    "id" uuid not null default gen_random_uuid(),
    "customer_id" uuid not null,
    "label" character varying(50),
    "address_line_1" character varying(255) not null,
    "address_line_2" character varying(255),
    "city" character varying(100) not null,
    "state_region" character varying(100),
    "postal_code" character varying(20),
    "country" character varying(100) default 'Myanmar'::character varying,
    "is_default" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."customer_addresses" enable row level security;


  create table "public"."customers" (
    "id" uuid not null default gen_random_uuid(),
    "project_id" uuid not null,
    "telegram_user_id" bigint,
    "telegram_username" character varying(100),
    "first_name" character varying(100),
    "last_name" character varying(100),
    "phone" character varying(20),
    "email" character varying(255),
    "preferred_language" character varying(10) default 'en'::character varying,
    "is_blocked" boolean default false,
    "notes" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."customers" enable row level security;


  create table "public"."invoices" (
    "id" uuid not null default gen_random_uuid(),
    "project_id" uuid not null,
    "order_id" uuid not null,
    "invoice_number" character varying(50) not null,
    "status" invoice_status_enum default 'draft'::invoice_status_enum,
    "issued_date" date not null default CURRENT_DATE,
    "due_date" date,
    "paid_date" date,
    "subtotal" numeric(12,2) not null,
    "tax_amount" numeric(12,2) default 0,
    "total_amount" numeric(12,2) not null,
    "notes" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."invoices" enable row level security;


  create table "public"."item_images" (
    "id" uuid not null default gen_random_uuid(),
    "item_id" uuid not null,
    "image_url" character varying(500) not null,
    "alt_text" character varying(255),
    "display_order" integer default 0,
    "is_primary" boolean default false,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."item_images" enable row level security;


  create table "public"."item_prices" (
    "id" uuid not null default gen_random_uuid(),
    "item_id" uuid not null,
    "base_price" numeric(12,2) not null,
    "selling_price" numeric(12,2) not null,
    "discount_percentage" numeric(5,2) default 0,
    "is_active" boolean default true,
    "effective_from" timestamp with time zone default now(),
    "effective_until" timestamp with time zone,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."item_prices" enable row level security;


  create table "public"."items" (
    "id" uuid not null default gen_random_uuid(),
    "project_id" uuid not null,
    "category_id" uuid,
    "name" character varying(255) not null,
    "description" text,
    "sku" character varying(100),
    "stock_quantity" integer not null default 0,
    "min_stock_level" integer default 0,
    "weight" numeric(8,2),
    "dimensions" jsonb,
    "is_active" boolean default true,
    "is_featured" boolean default false,
    "tags" text[],
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."items" enable row level security;


  create table "public"."order_items" (
    "id" uuid not null default gen_random_uuid(),
    "order_id" uuid not null,
    "item_id" uuid not null,
    "quantity" integer not null,
    "unit_price" numeric(12,2) not null,
    "discount_amount" numeric(12,2) default 0,
    "total_price" numeric(12,2) not null,
    "item_snapshot" jsonb not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."order_items" enable row level security;


  create table "public"."orders" (
    "id" uuid not null default gen_random_uuid(),
    "project_id" uuid not null,
    "customer_id" uuid not null,
    "order_number" character varying(50) not null,
    "status" order_status_enum default 'pending'::order_status_enum,
    "payment_method" payment_method_enum not null,
    "payment_status" payment_status_enum default 'pending'::payment_status_enum,
    "subtotal" numeric(12,2) not null,
    "discount_amount" numeric(12,2) default 0,
    "shipping_cost" numeric(12,2) default 0,
    "tax_amount" numeric(12,2) default 0,
    "total_amount" numeric(12,2) not null,
    "shipping_address" jsonb not null,
    "delivery_notes" text,
    "tracking_number" character varying(100),
    "notes" text,
    "internal_notes" text,
    "telegram_message_id" bigint,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "confirmed_at" timestamp with time zone,
    "delivered_at" timestamp with time zone,
    "paid_at" timestamp with time zone
      );


alter table "public"."orders" enable row level security;


  create table "public"."projects" (
    "id" uuid not null default gen_random_uuid(),
    "name" character varying(255) not null,
    "description" text,
    "telegram_bot_token" character varying(255),
    "telegram_webhook_url" character varying(500),
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."projects" enable row level security;


  create table "public"."stock_movements" (
    "id" uuid not null default gen_random_uuid(),
    "item_id" uuid not null,
    "movement_type" stock_movement_type_enum not null,
    "reason" stock_movement_reason_enum not null,
    "quantity" integer not null,
    "reference_id" uuid,
    "reference_type" character varying(50),
    "notes" text,
    "created_by" uuid,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."stock_movements" enable row level security;


  create table "public"."user_roles" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "project_id" uuid not null,
    "role" user_role_enum not null default 'agent'::user_role_enum,
    "permissions" jsonb default '{}'::jsonb,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."user_roles" enable row level security;

CREATE UNIQUE INDEX cart_items_customer_id_item_id_key ON public.cart_items USING btree (customer_id, item_id);

CREATE UNIQUE INDEX cart_items_pkey ON public.cart_items USING btree (id);

CREATE UNIQUE INDEX categories_pkey ON public.categories USING btree (id);

CREATE UNIQUE INDEX categories_project_id_name_key ON public.categories USING btree (project_id, name);

CREATE UNIQUE INDEX chat_messages_pkey ON public.chat_messages USING btree (id);

CREATE UNIQUE INDEX customer_addresses_pkey ON public.customer_addresses USING btree (id);

CREATE UNIQUE INDEX customers_pkey ON public.customers USING btree (id);

CREATE UNIQUE INDEX customers_telegram_user_id_key ON public.customers USING btree (telegram_user_id);

CREATE INDEX idx_cart_items_customer ON public.cart_items USING btree (customer_id);

CREATE INDEX idx_categories_active ON public.categories USING btree (project_id, is_active);

CREATE INDEX idx_categories_project ON public.categories USING btree (project_id);

CREATE INDEX idx_chat_messages_created ON public.chat_messages USING btree (created_at DESC);

CREATE INDEX idx_chat_messages_project_customer ON public.chat_messages USING btree (project_id, customer_id);

CREATE INDEX idx_customer_addresses_customer ON public.customer_addresses USING btree (customer_id);

CREATE INDEX idx_customers_phone ON public.customers USING btree (project_id, phone);

CREATE INDEX idx_customers_project ON public.customers USING btree (project_id);

CREATE INDEX idx_customers_telegram ON public.customers USING btree (telegram_user_id);

CREATE INDEX idx_invoices_due_date ON public.invoices USING btree (project_id, due_date);

CREATE INDEX idx_invoices_project ON public.invoices USING btree (project_id);

CREATE INDEX idx_invoices_status ON public.invoices USING btree (project_id, status);

CREATE INDEX idx_item_images_item ON public.item_images USING btree (item_id);

CREATE INDEX idx_item_images_primary ON public.item_images USING btree (item_id, is_primary);

CREATE INDEX idx_item_prices_active ON public.item_prices USING btree (item_id, is_active, effective_from);

CREATE INDEX idx_item_prices_effective ON public.item_prices USING btree (effective_from, effective_until);

CREATE INDEX idx_item_prices_item ON public.item_prices USING btree (item_id);

CREATE INDEX idx_items_active ON public.items USING btree (project_id, is_active);

CREATE INDEX idx_items_category ON public.items USING btree (category_id);

CREATE INDEX idx_items_featured ON public.items USING btree (project_id, is_featured);

CREATE INDEX idx_items_project ON public.items USING btree (project_id);

CREATE INDEX idx_items_stock ON public.items USING btree (project_id, stock_quantity);

CREATE INDEX idx_items_tags ON public.items USING gin (tags);

CREATE INDEX idx_order_items_item ON public.order_items USING btree (item_id);

CREATE INDEX idx_order_items_order ON public.order_items USING btree (order_id);

CREATE INDEX idx_orders_created ON public.orders USING btree (project_id, created_at DESC);

CREATE INDEX idx_orders_customer ON public.orders USING btree (customer_id);

CREATE INDEX idx_orders_number ON public.orders USING btree (project_id, order_number);

CREATE INDEX idx_orders_payment_status ON public.orders USING btree (project_id, payment_status);

CREATE INDEX idx_orders_project ON public.orders USING btree (project_id);

CREATE INDEX idx_orders_status ON public.orders USING btree (project_id, status);

CREATE INDEX idx_projects_active ON public.projects USING btree (is_active);

CREATE INDEX idx_stock_movements_created ON public.stock_movements USING btree (created_at DESC);

CREATE INDEX idx_stock_movements_item ON public.stock_movements USING btree (item_id);

CREATE INDEX idx_user_roles_project ON public.user_roles USING btree (project_id);

CREATE INDEX idx_user_roles_user_project ON public.user_roles USING btree (user_id, project_id);

CREATE UNIQUE INDEX invoices_order_id_key ON public.invoices USING btree (order_id);

CREATE UNIQUE INDEX invoices_pkey ON public.invoices USING btree (id);

CREATE UNIQUE INDEX invoices_project_id_invoice_number_key ON public.invoices USING btree (project_id, invoice_number);

CREATE UNIQUE INDEX item_images_pkey ON public.item_images USING btree (id);

select 1; 
-- CREATE INDEX item_prices_item_id_tstzrange_excl ON public.item_prices USING gist (item_id, tstzrange(effective_from, COALESCE(effective_until, 'infinity'::timestamp with time zone))) WHERE (is_active = true);

CREATE UNIQUE INDEX item_prices_pkey ON public.item_prices USING btree (id);

CREATE UNIQUE INDEX items_pkey ON public.items USING btree (id);

CREATE UNIQUE INDEX items_project_id_sku_key ON public.items USING btree (project_id, sku);

CREATE UNIQUE INDEX order_items_pkey ON public.order_items USING btree (id);

CREATE UNIQUE INDEX orders_pkey ON public.orders USING btree (id);

CREATE UNIQUE INDEX orders_project_id_order_number_key ON public.orders USING btree (project_id, order_number);

CREATE UNIQUE INDEX projects_pkey ON public.projects USING btree (id);

CREATE UNIQUE INDEX projects_telegram_bot_token_key ON public.projects USING btree (telegram_bot_token);

CREATE UNIQUE INDEX stock_movements_pkey ON public.stock_movements USING btree (id);

CREATE UNIQUE INDEX user_roles_pkey ON public.user_roles USING btree (id);

CREATE UNIQUE INDEX user_roles_user_id_project_id_key ON public.user_roles USING btree (user_id, project_id);

alter table "public"."cart_items" add constraint "cart_items_pkey" PRIMARY KEY using index "cart_items_pkey";

alter table "public"."categories" add constraint "categories_pkey" PRIMARY KEY using index "categories_pkey";

alter table "public"."chat_messages" add constraint "chat_messages_pkey" PRIMARY KEY using index "chat_messages_pkey";

alter table "public"."customer_addresses" add constraint "customer_addresses_pkey" PRIMARY KEY using index "customer_addresses_pkey";

alter table "public"."customers" add constraint "customers_pkey" PRIMARY KEY using index "customers_pkey";

alter table "public"."invoices" add constraint "invoices_pkey" PRIMARY KEY using index "invoices_pkey";

alter table "public"."item_images" add constraint "item_images_pkey" PRIMARY KEY using index "item_images_pkey";

alter table "public"."item_prices" add constraint "item_prices_pkey" PRIMARY KEY using index "item_prices_pkey";

alter table "public"."items" add constraint "items_pkey" PRIMARY KEY using index "items_pkey";

alter table "public"."order_items" add constraint "order_items_pkey" PRIMARY KEY using index "order_items_pkey";

alter table "public"."orders" add constraint "orders_pkey" PRIMARY KEY using index "orders_pkey";

alter table "public"."projects" add constraint "projects_pkey" PRIMARY KEY using index "projects_pkey";

alter table "public"."stock_movements" add constraint "stock_movements_pkey" PRIMARY KEY using index "stock_movements_pkey";

alter table "public"."user_roles" add constraint "user_roles_pkey" PRIMARY KEY using index "user_roles_pkey";

alter table "public"."cart_items" add constraint "cart_items_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE not valid;

alter table "public"."cart_items" validate constraint "cart_items_customer_id_fkey";

alter table "public"."cart_items" add constraint "cart_items_customer_id_item_id_key" UNIQUE using index "cart_items_customer_id_item_id_key";

alter table "public"."cart_items" add constraint "cart_items_item_id_fkey" FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE not valid;

alter table "public"."cart_items" validate constraint "cart_items_item_id_fkey";

alter table "public"."cart_items" add constraint "cart_items_quantity_check" CHECK ((quantity > 0)) not valid;

alter table "public"."cart_items" validate constraint "cart_items_quantity_check";

alter table "public"."categories" add constraint "categories_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE not valid;

alter table "public"."categories" validate constraint "categories_project_id_fkey";

alter table "public"."categories" add constraint "categories_project_id_name_key" UNIQUE using index "categories_project_id_name_key";

alter table "public"."chat_messages" add constraint "chat_messages_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES customers(id) not valid;

alter table "public"."chat_messages" validate constraint "chat_messages_customer_id_fkey";

alter table "public"."chat_messages" add constraint "chat_messages_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE not valid;

alter table "public"."chat_messages" validate constraint "chat_messages_project_id_fkey";

alter table "public"."chat_messages" add constraint "chat_messages_reply_to_message_id_fkey" FOREIGN KEY (reply_to_message_id) REFERENCES chat_messages(id) not valid;

alter table "public"."chat_messages" validate constraint "chat_messages_reply_to_message_id_fkey";

alter table "public"."customer_addresses" add constraint "customer_addresses_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE not valid;

alter table "public"."customer_addresses" validate constraint "customer_addresses_customer_id_fkey";

alter table "public"."customers" add constraint "customers_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE not valid;

alter table "public"."customers" validate constraint "customers_project_id_fkey";

alter table "public"."customers" add constraint "customers_telegram_user_id_key" UNIQUE using index "customers_telegram_user_id_key";

alter table "public"."invoices" add constraint "invoices_order_id_fkey" FOREIGN KEY (order_id) REFERENCES orders(id) not valid;

alter table "public"."invoices" validate constraint "invoices_order_id_fkey";

alter table "public"."invoices" add constraint "invoices_order_id_key" UNIQUE using index "invoices_order_id_key";

alter table "public"."invoices" add constraint "invoices_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE not valid;

alter table "public"."invoices" validate constraint "invoices_project_id_fkey";

alter table "public"."invoices" add constraint "invoices_project_id_invoice_number_key" UNIQUE using index "invoices_project_id_invoice_number_key";

alter table "public"."item_images" add constraint "item_images_item_id_fkey" FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE not valid;

alter table "public"."item_images" validate constraint "item_images_item_id_fkey";

alter table "public"."item_prices" add constraint "item_prices_base_price_check" CHECK ((base_price >= (0)::numeric)) not valid;

alter table "public"."item_prices" validate constraint "item_prices_base_price_check";

alter table "public"."item_prices" add constraint "item_prices_discount_percentage_check" CHECK (((discount_percentage >= (0)::numeric) AND (discount_percentage <= (100)::numeric))) not valid;

alter table "public"."item_prices" validate constraint "item_prices_discount_percentage_check";

alter table "public"."item_prices" add constraint "item_prices_item_id_fkey" FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE not valid;

alter table "public"."item_prices" validate constraint "item_prices_item_id_fkey";

alter table "public"."item_prices" add constraint "item_prices_item_id_tstzrange_excl" EXCLUDE USING gist (item_id WITH =, tstzrange(effective_from, COALESCE(effective_until, 'infinity'::timestamp with time zone)) WITH &&) WHERE ((is_active = true));

alter table "public"."item_prices" add constraint "item_prices_selling_price_check" CHECK ((selling_price >= (0)::numeric)) not valid;

alter table "public"."item_prices" validate constraint "item_prices_selling_price_check";

alter table "public"."items" add constraint "items_category_id_fkey" FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL not valid;

alter table "public"."items" validate constraint "items_category_id_fkey";

alter table "public"."items" add constraint "items_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE not valid;

alter table "public"."items" validate constraint "items_project_id_fkey";

alter table "public"."items" add constraint "items_project_id_sku_key" UNIQUE using index "items_project_id_sku_key";

alter table "public"."items" add constraint "items_stock_quantity_check" CHECK ((stock_quantity >= 0)) not valid;

alter table "public"."items" validate constraint "items_stock_quantity_check";

alter table "public"."order_items" add constraint "order_items_discount_amount_check" CHECK ((discount_amount >= (0)::numeric)) not valid;

alter table "public"."order_items" validate constraint "order_items_discount_amount_check";

alter table "public"."order_items" add constraint "order_items_item_id_fkey" FOREIGN KEY (item_id) REFERENCES items(id) not valid;

alter table "public"."order_items" validate constraint "order_items_item_id_fkey";

alter table "public"."order_items" add constraint "order_items_order_id_fkey" FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE not valid;

alter table "public"."order_items" validate constraint "order_items_order_id_fkey";

alter table "public"."order_items" add constraint "order_items_quantity_check" CHECK ((quantity > 0)) not valid;

alter table "public"."order_items" validate constraint "order_items_quantity_check";

alter table "public"."order_items" add constraint "order_items_total_price_check" CHECK ((total_price >= (0)::numeric)) not valid;

alter table "public"."order_items" validate constraint "order_items_total_price_check";

alter table "public"."order_items" add constraint "order_items_unit_price_check" CHECK ((unit_price >= (0)::numeric)) not valid;

alter table "public"."order_items" validate constraint "order_items_unit_price_check";

alter table "public"."orders" add constraint "orders_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES customers(id) not valid;

alter table "public"."orders" validate constraint "orders_customer_id_fkey";

alter table "public"."orders" add constraint "orders_discount_amount_check" CHECK ((discount_amount >= (0)::numeric)) not valid;

alter table "public"."orders" validate constraint "orders_discount_amount_check";

alter table "public"."orders" add constraint "orders_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE not valid;

alter table "public"."orders" validate constraint "orders_project_id_fkey";

alter table "public"."orders" add constraint "orders_project_id_order_number_key" UNIQUE using index "orders_project_id_order_number_key";

alter table "public"."orders" add constraint "orders_shipping_cost_check" CHECK ((shipping_cost >= (0)::numeric)) not valid;

alter table "public"."orders" validate constraint "orders_shipping_cost_check";

alter table "public"."orders" add constraint "orders_subtotal_check" CHECK ((subtotal >= (0)::numeric)) not valid;

alter table "public"."orders" validate constraint "orders_subtotal_check";

alter table "public"."orders" add constraint "orders_tax_amount_check" CHECK ((tax_amount >= (0)::numeric)) not valid;

alter table "public"."orders" validate constraint "orders_tax_amount_check";

alter table "public"."orders" add constraint "orders_total_amount_check" CHECK ((total_amount >= (0)::numeric)) not valid;

alter table "public"."orders" validate constraint "orders_total_amount_check";

alter table "public"."projects" add constraint "projects_telegram_bot_token_key" UNIQUE using index "projects_telegram_bot_token_key";

alter table "public"."stock_movements" add constraint "stock_movements_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."stock_movements" validate constraint "stock_movements_created_by_fkey";

alter table "public"."stock_movements" add constraint "stock_movements_item_id_fkey" FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE not valid;

alter table "public"."stock_movements" validate constraint "stock_movements_item_id_fkey";

alter table "public"."user_roles" add constraint "user_roles_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE not valid;

alter table "public"."user_roles" validate constraint "user_roles_project_id_fkey";

alter table "public"."user_roles" add constraint "user_roles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_roles" validate constraint "user_roles_user_id_fkey";

alter table "public"."user_roles" add constraint "user_roles_user_id_project_id_key" UNIQUE using index "user_roles_user_id_project_id_key";

set check_function_bodies = off;

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
    o.subtotal,
    o.discount_amount,
    o.shipping_cost,
    o.tax_amount,
    o.total_amount,
    o.shipping_address,
    o.delivery_notes,
    o.tracking_number,
    o.notes,
    o.internal_notes,
    o.telegram_message_id,
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


CREATE OR REPLACE FUNCTION public.update_item_stock()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
    new.updated_at = now();
    return new;
end;
$function$
;

grant delete on table "public"."cart_items" to "anon";

grant insert on table "public"."cart_items" to "anon";

grant references on table "public"."cart_items" to "anon";

grant select on table "public"."cart_items" to "anon";

grant trigger on table "public"."cart_items" to "anon";

grant truncate on table "public"."cart_items" to "anon";

grant update on table "public"."cart_items" to "anon";

grant delete on table "public"."cart_items" to "authenticated";

grant insert on table "public"."cart_items" to "authenticated";

grant references on table "public"."cart_items" to "authenticated";

grant select on table "public"."cart_items" to "authenticated";

grant trigger on table "public"."cart_items" to "authenticated";

grant truncate on table "public"."cart_items" to "authenticated";

grant update on table "public"."cart_items" to "authenticated";

grant delete on table "public"."cart_items" to "service_role";

grant insert on table "public"."cart_items" to "service_role";

grant references on table "public"."cart_items" to "service_role";

grant select on table "public"."cart_items" to "service_role";

grant trigger on table "public"."cart_items" to "service_role";

grant truncate on table "public"."cart_items" to "service_role";

grant update on table "public"."cart_items" to "service_role";

grant delete on table "public"."categories" to "anon";

grant insert on table "public"."categories" to "anon";

grant references on table "public"."categories" to "anon";

grant select on table "public"."categories" to "anon";

grant trigger on table "public"."categories" to "anon";

grant truncate on table "public"."categories" to "anon";

grant update on table "public"."categories" to "anon";

grant delete on table "public"."categories" to "authenticated";

grant insert on table "public"."categories" to "authenticated";

grant references on table "public"."categories" to "authenticated";

grant select on table "public"."categories" to "authenticated";

grant trigger on table "public"."categories" to "authenticated";

grant truncate on table "public"."categories" to "authenticated";

grant update on table "public"."categories" to "authenticated";

grant delete on table "public"."categories" to "service_role";

grant insert on table "public"."categories" to "service_role";

grant references on table "public"."categories" to "service_role";

grant select on table "public"."categories" to "service_role";

grant trigger on table "public"."categories" to "service_role";

grant truncate on table "public"."categories" to "service_role";

grant update on table "public"."categories" to "service_role";

grant delete on table "public"."chat_messages" to "anon";

grant insert on table "public"."chat_messages" to "anon";

grant references on table "public"."chat_messages" to "anon";

grant select on table "public"."chat_messages" to "anon";

grant trigger on table "public"."chat_messages" to "anon";

grant truncate on table "public"."chat_messages" to "anon";

grant update on table "public"."chat_messages" to "anon";

grant delete on table "public"."chat_messages" to "authenticated";

grant insert on table "public"."chat_messages" to "authenticated";

grant references on table "public"."chat_messages" to "authenticated";

grant select on table "public"."chat_messages" to "authenticated";

grant trigger on table "public"."chat_messages" to "authenticated";

grant truncate on table "public"."chat_messages" to "authenticated";

grant update on table "public"."chat_messages" to "authenticated";

grant delete on table "public"."chat_messages" to "service_role";

grant insert on table "public"."chat_messages" to "service_role";

grant references on table "public"."chat_messages" to "service_role";

grant select on table "public"."chat_messages" to "service_role";

grant trigger on table "public"."chat_messages" to "service_role";

grant truncate on table "public"."chat_messages" to "service_role";

grant update on table "public"."chat_messages" to "service_role";

grant delete on table "public"."customer_addresses" to "anon";

grant insert on table "public"."customer_addresses" to "anon";

grant references on table "public"."customer_addresses" to "anon";

grant select on table "public"."customer_addresses" to "anon";

grant trigger on table "public"."customer_addresses" to "anon";

grant truncate on table "public"."customer_addresses" to "anon";

grant update on table "public"."customer_addresses" to "anon";

grant delete on table "public"."customer_addresses" to "authenticated";

grant insert on table "public"."customer_addresses" to "authenticated";

grant references on table "public"."customer_addresses" to "authenticated";

grant select on table "public"."customer_addresses" to "authenticated";

grant trigger on table "public"."customer_addresses" to "authenticated";

grant truncate on table "public"."customer_addresses" to "authenticated";

grant update on table "public"."customer_addresses" to "authenticated";

grant delete on table "public"."customer_addresses" to "service_role";

grant insert on table "public"."customer_addresses" to "service_role";

grant references on table "public"."customer_addresses" to "service_role";

grant select on table "public"."customer_addresses" to "service_role";

grant trigger on table "public"."customer_addresses" to "service_role";

grant truncate on table "public"."customer_addresses" to "service_role";

grant update on table "public"."customer_addresses" to "service_role";

grant delete on table "public"."customers" to "anon";

grant insert on table "public"."customers" to "anon";

grant references on table "public"."customers" to "anon";

grant select on table "public"."customers" to "anon";

grant trigger on table "public"."customers" to "anon";

grant truncate on table "public"."customers" to "anon";

grant update on table "public"."customers" to "anon";

grant delete on table "public"."customers" to "authenticated";

grant insert on table "public"."customers" to "authenticated";

grant references on table "public"."customers" to "authenticated";

grant select on table "public"."customers" to "authenticated";

grant trigger on table "public"."customers" to "authenticated";

grant truncate on table "public"."customers" to "authenticated";

grant update on table "public"."customers" to "authenticated";

grant delete on table "public"."customers" to "service_role";

grant insert on table "public"."customers" to "service_role";

grant references on table "public"."customers" to "service_role";

grant select on table "public"."customers" to "service_role";

grant trigger on table "public"."customers" to "service_role";

grant truncate on table "public"."customers" to "service_role";

grant update on table "public"."customers" to "service_role";

grant delete on table "public"."invoices" to "anon";

grant insert on table "public"."invoices" to "anon";

grant references on table "public"."invoices" to "anon";

grant select on table "public"."invoices" to "anon";

grant trigger on table "public"."invoices" to "anon";

grant truncate on table "public"."invoices" to "anon";

grant update on table "public"."invoices" to "anon";

grant delete on table "public"."invoices" to "authenticated";

grant insert on table "public"."invoices" to "authenticated";

grant references on table "public"."invoices" to "authenticated";

grant select on table "public"."invoices" to "authenticated";

grant trigger on table "public"."invoices" to "authenticated";

grant truncate on table "public"."invoices" to "authenticated";

grant update on table "public"."invoices" to "authenticated";

grant delete on table "public"."invoices" to "service_role";

grant insert on table "public"."invoices" to "service_role";

grant references on table "public"."invoices" to "service_role";

grant select on table "public"."invoices" to "service_role";

grant trigger on table "public"."invoices" to "service_role";

grant truncate on table "public"."invoices" to "service_role";

grant update on table "public"."invoices" to "service_role";

grant delete on table "public"."item_images" to "anon";

grant insert on table "public"."item_images" to "anon";

grant references on table "public"."item_images" to "anon";

grant select on table "public"."item_images" to "anon";

grant trigger on table "public"."item_images" to "anon";

grant truncate on table "public"."item_images" to "anon";

grant update on table "public"."item_images" to "anon";

grant delete on table "public"."item_images" to "authenticated";

grant insert on table "public"."item_images" to "authenticated";

grant references on table "public"."item_images" to "authenticated";

grant select on table "public"."item_images" to "authenticated";

grant trigger on table "public"."item_images" to "authenticated";

grant truncate on table "public"."item_images" to "authenticated";

grant update on table "public"."item_images" to "authenticated";

grant delete on table "public"."item_images" to "service_role";

grant insert on table "public"."item_images" to "service_role";

grant references on table "public"."item_images" to "service_role";

grant select on table "public"."item_images" to "service_role";

grant trigger on table "public"."item_images" to "service_role";

grant truncate on table "public"."item_images" to "service_role";

grant update on table "public"."item_images" to "service_role";

grant delete on table "public"."item_prices" to "anon";

grant insert on table "public"."item_prices" to "anon";

grant references on table "public"."item_prices" to "anon";

grant select on table "public"."item_prices" to "anon";

grant trigger on table "public"."item_prices" to "anon";

grant truncate on table "public"."item_prices" to "anon";

grant update on table "public"."item_prices" to "anon";

grant delete on table "public"."item_prices" to "authenticated";

grant insert on table "public"."item_prices" to "authenticated";

grant references on table "public"."item_prices" to "authenticated";

grant select on table "public"."item_prices" to "authenticated";

grant trigger on table "public"."item_prices" to "authenticated";

grant truncate on table "public"."item_prices" to "authenticated";

grant update on table "public"."item_prices" to "authenticated";

grant delete on table "public"."item_prices" to "service_role";

grant insert on table "public"."item_prices" to "service_role";

grant references on table "public"."item_prices" to "service_role";

grant select on table "public"."item_prices" to "service_role";

grant trigger on table "public"."item_prices" to "service_role";

grant truncate on table "public"."item_prices" to "service_role";

grant update on table "public"."item_prices" to "service_role";

grant delete on table "public"."items" to "anon";

grant insert on table "public"."items" to "anon";

grant references on table "public"."items" to "anon";

grant select on table "public"."items" to "anon";

grant trigger on table "public"."items" to "anon";

grant truncate on table "public"."items" to "anon";

grant update on table "public"."items" to "anon";

grant delete on table "public"."items" to "authenticated";

grant insert on table "public"."items" to "authenticated";

grant references on table "public"."items" to "authenticated";

grant select on table "public"."items" to "authenticated";

grant trigger on table "public"."items" to "authenticated";

grant truncate on table "public"."items" to "authenticated";

grant update on table "public"."items" to "authenticated";

grant delete on table "public"."items" to "service_role";

grant insert on table "public"."items" to "service_role";

grant references on table "public"."items" to "service_role";

grant select on table "public"."items" to "service_role";

grant trigger on table "public"."items" to "service_role";

grant truncate on table "public"."items" to "service_role";

grant update on table "public"."items" to "service_role";

grant delete on table "public"."order_items" to "anon";

grant insert on table "public"."order_items" to "anon";

grant references on table "public"."order_items" to "anon";

grant select on table "public"."order_items" to "anon";

grant trigger on table "public"."order_items" to "anon";

grant truncate on table "public"."order_items" to "anon";

grant update on table "public"."order_items" to "anon";

grant delete on table "public"."order_items" to "authenticated";

grant insert on table "public"."order_items" to "authenticated";

grant references on table "public"."order_items" to "authenticated";

grant select on table "public"."order_items" to "authenticated";

grant trigger on table "public"."order_items" to "authenticated";

grant truncate on table "public"."order_items" to "authenticated";

grant update on table "public"."order_items" to "authenticated";

grant delete on table "public"."order_items" to "service_role";

grant insert on table "public"."order_items" to "service_role";

grant references on table "public"."order_items" to "service_role";

grant select on table "public"."order_items" to "service_role";

grant trigger on table "public"."order_items" to "service_role";

grant truncate on table "public"."order_items" to "service_role";

grant update on table "public"."order_items" to "service_role";

grant delete on table "public"."orders" to "anon";

grant insert on table "public"."orders" to "anon";

grant references on table "public"."orders" to "anon";

grant select on table "public"."orders" to "anon";

grant trigger on table "public"."orders" to "anon";

grant truncate on table "public"."orders" to "anon";

grant update on table "public"."orders" to "anon";

grant delete on table "public"."orders" to "authenticated";

grant insert on table "public"."orders" to "authenticated";

grant references on table "public"."orders" to "authenticated";

grant select on table "public"."orders" to "authenticated";

grant trigger on table "public"."orders" to "authenticated";

grant truncate on table "public"."orders" to "authenticated";

grant update on table "public"."orders" to "authenticated";

grant delete on table "public"."orders" to "service_role";

grant insert on table "public"."orders" to "service_role";

grant references on table "public"."orders" to "service_role";

grant select on table "public"."orders" to "service_role";

grant trigger on table "public"."orders" to "service_role";

grant truncate on table "public"."orders" to "service_role";

grant update on table "public"."orders" to "service_role";

grant delete on table "public"."projects" to "anon";

grant insert on table "public"."projects" to "anon";

grant references on table "public"."projects" to "anon";

grant select on table "public"."projects" to "anon";

grant trigger on table "public"."projects" to "anon";

grant truncate on table "public"."projects" to "anon";

grant update on table "public"."projects" to "anon";

grant delete on table "public"."projects" to "authenticated";

grant insert on table "public"."projects" to "authenticated";

grant references on table "public"."projects" to "authenticated";

grant select on table "public"."projects" to "authenticated";

grant trigger on table "public"."projects" to "authenticated";

grant truncate on table "public"."projects" to "authenticated";

grant update on table "public"."projects" to "authenticated";

grant delete on table "public"."projects" to "service_role";

grant insert on table "public"."projects" to "service_role";

grant references on table "public"."projects" to "service_role";

grant select on table "public"."projects" to "service_role";

grant trigger on table "public"."projects" to "service_role";

grant truncate on table "public"."projects" to "service_role";

grant update on table "public"."projects" to "service_role";

grant delete on table "public"."stock_movements" to "anon";

grant insert on table "public"."stock_movements" to "anon";

grant references on table "public"."stock_movements" to "anon";

grant select on table "public"."stock_movements" to "anon";

grant trigger on table "public"."stock_movements" to "anon";

grant truncate on table "public"."stock_movements" to "anon";

grant update on table "public"."stock_movements" to "anon";

grant delete on table "public"."stock_movements" to "authenticated";

grant insert on table "public"."stock_movements" to "authenticated";

grant references on table "public"."stock_movements" to "authenticated";

grant select on table "public"."stock_movements" to "authenticated";

grant trigger on table "public"."stock_movements" to "authenticated";

grant truncate on table "public"."stock_movements" to "authenticated";

grant update on table "public"."stock_movements" to "authenticated";

grant delete on table "public"."stock_movements" to "service_role";

grant insert on table "public"."stock_movements" to "service_role";

grant references on table "public"."stock_movements" to "service_role";

grant select on table "public"."stock_movements" to "service_role";

grant trigger on table "public"."stock_movements" to "service_role";

grant truncate on table "public"."stock_movements" to "service_role";

grant update on table "public"."stock_movements" to "service_role";

grant delete on table "public"."user_roles" to "anon";

grant insert on table "public"."user_roles" to "anon";

grant references on table "public"."user_roles" to "anon";

grant select on table "public"."user_roles" to "anon";

grant trigger on table "public"."user_roles" to "anon";

grant truncate on table "public"."user_roles" to "anon";

grant update on table "public"."user_roles" to "anon";

grant delete on table "public"."user_roles" to "authenticated";

grant insert on table "public"."user_roles" to "authenticated";

grant references on table "public"."user_roles" to "authenticated";

grant select on table "public"."user_roles" to "authenticated";

grant trigger on table "public"."user_roles" to "authenticated";

grant truncate on table "public"."user_roles" to "authenticated";

grant update on table "public"."user_roles" to "authenticated";

grant delete on table "public"."user_roles" to "service_role";

grant insert on table "public"."user_roles" to "service_role";

grant references on table "public"."user_roles" to "service_role";

grant select on table "public"."user_roles" to "service_role";

grant trigger on table "public"."user_roles" to "service_role";

grant truncate on table "public"."user_roles" to "service_role";

grant update on table "public"."user_roles" to "service_role";


  create policy "Users can create cart items in their projects"
  on "public"."cart_items"
  as permissive
  for insert
  to authenticated
with check ((customer_id IN ( SELECT c.id
   FROM (customers c
     JOIN user_roles ur ON ((c.project_id = ur.project_id)))
  WHERE ((ur.user_id = ( SELECT auth.uid() AS uid)) AND (ur.is_active = true)))));



  create policy "Users can delete cart items in their projects"
  on "public"."cart_items"
  as permissive
  for delete
  to authenticated
using ((customer_id IN ( SELECT c.id
   FROM (customers c
     JOIN user_roles ur ON ((c.project_id = ur.project_id)))
  WHERE ((ur.user_id = ( SELECT auth.uid() AS uid)) AND (ur.is_active = true)))));



  create policy "Users can update cart items in their projects"
  on "public"."cart_items"
  as permissive
  for update
  to authenticated
using ((customer_id IN ( SELECT c.id
   FROM (customers c
     JOIN user_roles ur ON ((c.project_id = ur.project_id)))
  WHERE ((ur.user_id = ( SELECT auth.uid() AS uid)) AND (ur.is_active = true)))))
with check ((customer_id IN ( SELECT c.id
   FROM (customers c
     JOIN user_roles ur ON ((c.project_id = ur.project_id)))
  WHERE ((ur.user_id = ( SELECT auth.uid() AS uid)) AND (ur.is_active = true)))));



  create policy "Users can view cart items in their projects"
  on "public"."cart_items"
  as permissive
  for select
  to authenticated
using ((customer_id IN ( SELECT c.id
   FROM (customers c
     JOIN user_roles ur ON ((c.project_id = ur.project_id)))
  WHERE ((ur.user_id = ( SELECT auth.uid() AS uid)) AND (ur.is_active = true)))));



  create policy "Users can create categories in their projects"
  on "public"."categories"
  as permissive
  for insert
  to authenticated
with check ((project_id IN ( SELECT user_roles.project_id
   FROM user_roles
  WHERE ((user_roles.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles.is_active = true)))));



  create policy "Users can delete categories in their projects"
  on "public"."categories"
  as permissive
  for delete
  to authenticated
using ((project_id IN ( SELECT user_roles.project_id
   FROM user_roles
  WHERE ((user_roles.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles.is_active = true)))));



  create policy "Users can update categories in their projects"
  on "public"."categories"
  as permissive
  for update
  to authenticated
using ((project_id IN ( SELECT user_roles.project_id
   FROM user_roles
  WHERE ((user_roles.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles.is_active = true)))))
with check ((project_id IN ( SELECT user_roles.project_id
   FROM user_roles
  WHERE ((user_roles.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles.is_active = true)))));



  create policy "Users can view categories in their projects"
  on "public"."categories"
  as permissive
  for select
  to authenticated
using ((project_id IN ( SELECT user_roles.project_id
   FROM user_roles
  WHERE ((user_roles.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles.is_active = true)))));



  create policy "Users can create chat messages in their projects"
  on "public"."chat_messages"
  as permissive
  for insert
  to authenticated
with check ((project_id IN ( SELECT user_roles.project_id
   FROM user_roles
  WHERE ((user_roles.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles.is_active = true)))));



  create policy "Users can delete chat messages in their projects"
  on "public"."chat_messages"
  as permissive
  for delete
  to authenticated
using ((project_id IN ( SELECT user_roles.project_id
   FROM user_roles
  WHERE ((user_roles.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles.is_active = true)))));



  create policy "Users can update chat messages in their projects"
  on "public"."chat_messages"
  as permissive
  for update
  to authenticated
using ((project_id IN ( SELECT user_roles.project_id
   FROM user_roles
  WHERE ((user_roles.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles.is_active = true)))))
with check ((project_id IN ( SELECT user_roles.project_id
   FROM user_roles
  WHERE ((user_roles.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles.is_active = true)))));



  create policy "Users can view chat messages in their projects"
  on "public"."chat_messages"
  as permissive
  for select
  to authenticated
using ((project_id IN ( SELECT user_roles.project_id
   FROM user_roles
  WHERE ((user_roles.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles.is_active = true)))));



  create policy "Users can create customer addresses in their projects"
  on "public"."customer_addresses"
  as permissive
  for insert
  to authenticated
with check ((customer_id IN ( SELECT c.id
   FROM (customers c
     JOIN user_roles ur ON ((c.project_id = ur.project_id)))
  WHERE ((ur.user_id = ( SELECT auth.uid() AS uid)) AND (ur.is_active = true)))));



  create policy "Users can delete customer addresses in their projects"
  on "public"."customer_addresses"
  as permissive
  for delete
  to authenticated
using ((customer_id IN ( SELECT c.id
   FROM (customers c
     JOIN user_roles ur ON ((c.project_id = ur.project_id)))
  WHERE ((ur.user_id = ( SELECT auth.uid() AS uid)) AND (ur.is_active = true)))));



  create policy "Users can update customer addresses in their projects"
  on "public"."customer_addresses"
  as permissive
  for update
  to authenticated
using ((customer_id IN ( SELECT c.id
   FROM (customers c
     JOIN user_roles ur ON ((c.project_id = ur.project_id)))
  WHERE ((ur.user_id = ( SELECT auth.uid() AS uid)) AND (ur.is_active = true)))))
with check ((customer_id IN ( SELECT c.id
   FROM (customers c
     JOIN user_roles ur ON ((c.project_id = ur.project_id)))
  WHERE ((ur.user_id = ( SELECT auth.uid() AS uid)) AND (ur.is_active = true)))));



  create policy "Users can view customer addresses in their projects"
  on "public"."customer_addresses"
  as permissive
  for select
  to authenticated
using ((customer_id IN ( SELECT c.id
   FROM (customers c
     JOIN user_roles ur ON ((c.project_id = ur.project_id)))
  WHERE ((ur.user_id = ( SELECT auth.uid() AS uid)) AND (ur.is_active = true)))));



  create policy "Users can create customers in their projects"
  on "public"."customers"
  as permissive
  for insert
  to authenticated
with check ((project_id IN ( SELECT user_roles.project_id
   FROM user_roles
  WHERE ((user_roles.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles.is_active = true)))));



  create policy "Users can delete customers in their projects"
  on "public"."customers"
  as permissive
  for delete
  to authenticated
using ((project_id IN ( SELECT user_roles.project_id
   FROM user_roles
  WHERE ((user_roles.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles.is_active = true)))));



  create policy "Users can update customers in their projects"
  on "public"."customers"
  as permissive
  for update
  to authenticated
using ((project_id IN ( SELECT user_roles.project_id
   FROM user_roles
  WHERE ((user_roles.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles.is_active = true)))))
with check ((project_id IN ( SELECT user_roles.project_id
   FROM user_roles
  WHERE ((user_roles.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles.is_active = true)))));



  create policy "Users can view customers in their projects"
  on "public"."customers"
  as permissive
  for select
  to authenticated
using ((project_id IN ( SELECT user_roles.project_id
   FROM user_roles
  WHERE ((user_roles.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles.is_active = true)))));



  create policy "Users can create invoices in their projects"
  on "public"."invoices"
  as permissive
  for insert
  to authenticated
with check ((project_id IN ( SELECT user_roles.project_id
   FROM user_roles
  WHERE ((user_roles.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles.is_active = true)))));



  create policy "Users can delete invoices in their projects"
  on "public"."invoices"
  as permissive
  for delete
  to authenticated
using ((project_id IN ( SELECT user_roles.project_id
   FROM user_roles
  WHERE ((user_roles.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles.is_active = true)))));



  create policy "Users can update invoices in their projects"
  on "public"."invoices"
  as permissive
  for update
  to authenticated
using ((project_id IN ( SELECT user_roles.project_id
   FROM user_roles
  WHERE ((user_roles.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles.is_active = true)))))
with check ((project_id IN ( SELECT user_roles.project_id
   FROM user_roles
  WHERE ((user_roles.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles.is_active = true)))));



  create policy "Users can view invoices in their projects"
  on "public"."invoices"
  as permissive
  for select
  to authenticated
using ((project_id IN ( SELECT user_roles.project_id
   FROM user_roles
  WHERE ((user_roles.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles.is_active = true)))));



  create policy "Users can create item images in their projects"
  on "public"."item_images"
  as permissive
  for insert
  to authenticated
with check ((item_id IN ( SELECT i.id
   FROM (items i
     JOIN user_roles ur ON ((i.project_id = ur.project_id)))
  WHERE ((ur.user_id = ( SELECT auth.uid() AS uid)) AND (ur.is_active = true)))));



  create policy "Users can delete item images in their projects"
  on "public"."item_images"
  as permissive
  for delete
  to authenticated
using ((item_id IN ( SELECT i.id
   FROM (items i
     JOIN user_roles ur ON ((i.project_id = ur.project_id)))
  WHERE ((ur.user_id = ( SELECT auth.uid() AS uid)) AND (ur.is_active = true)))));



  create policy "Users can update item images in their projects"
  on "public"."item_images"
  as permissive
  for update
  to authenticated
using ((item_id IN ( SELECT i.id
   FROM (items i
     JOIN user_roles ur ON ((i.project_id = ur.project_id)))
  WHERE ((ur.user_id = ( SELECT auth.uid() AS uid)) AND (ur.is_active = true)))))
with check ((item_id IN ( SELECT i.id
   FROM (items i
     JOIN user_roles ur ON ((i.project_id = ur.project_id)))
  WHERE ((ur.user_id = ( SELECT auth.uid() AS uid)) AND (ur.is_active = true)))));



  create policy "Users can view item images in their projects"
  on "public"."item_images"
  as permissive
  for select
  to authenticated
using ((item_id IN ( SELECT i.id
   FROM (items i
     JOIN user_roles ur ON ((i.project_id = ur.project_id)))
  WHERE ((ur.user_id = ( SELECT auth.uid() AS uid)) AND (ur.is_active = true)))));



  create policy "Users can create item prices in their projects"
  on "public"."item_prices"
  as permissive
  for insert
  to authenticated
with check ((item_id IN ( SELECT i.id
   FROM (items i
     JOIN user_roles ur ON ((i.project_id = ur.project_id)))
  WHERE ((ur.user_id = ( SELECT auth.uid() AS uid)) AND (ur.is_active = true)))));



  create policy "Users can delete item prices in their projects"
  on "public"."item_prices"
  as permissive
  for delete
  to authenticated
using ((item_id IN ( SELECT i.id
   FROM (items i
     JOIN user_roles ur ON ((i.project_id = ur.project_id)))
  WHERE ((ur.user_id = ( SELECT auth.uid() AS uid)) AND (ur.is_active = true)))));



  create policy "Users can update item prices in their projects"
  on "public"."item_prices"
  as permissive
  for update
  to authenticated
using ((item_id IN ( SELECT i.id
   FROM (items i
     JOIN user_roles ur ON ((i.project_id = ur.project_id)))
  WHERE ((ur.user_id = ( SELECT auth.uid() AS uid)) AND (ur.is_active = true)))))
with check ((item_id IN ( SELECT i.id
   FROM (items i
     JOIN user_roles ur ON ((i.project_id = ur.project_id)))
  WHERE ((ur.user_id = ( SELECT auth.uid() AS uid)) AND (ur.is_active = true)))));



  create policy "Users can view item prices in their projects"
  on "public"."item_prices"
  as permissive
  for select
  to authenticated
using ((item_id IN ( SELECT i.id
   FROM (items i
     JOIN user_roles ur ON ((i.project_id = ur.project_id)))
  WHERE ((ur.user_id = ( SELECT auth.uid() AS uid)) AND (ur.is_active = true)))));



  create policy "Users can create items in their projects"
  on "public"."items"
  as permissive
  for insert
  to authenticated
with check ((project_id IN ( SELECT user_roles.project_id
   FROM user_roles
  WHERE ((user_roles.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles.is_active = true)))));



  create policy "Users can delete items in their projects"
  on "public"."items"
  as permissive
  for delete
  to authenticated
using ((project_id IN ( SELECT user_roles.project_id
   FROM user_roles
  WHERE ((user_roles.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles.is_active = true)))));



  create policy "Users can update items in their projects"
  on "public"."items"
  as permissive
  for update
  to authenticated
using ((project_id IN ( SELECT user_roles.project_id
   FROM user_roles
  WHERE ((user_roles.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles.is_active = true)))))
with check ((project_id IN ( SELECT user_roles.project_id
   FROM user_roles
  WHERE ((user_roles.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles.is_active = true)))));



  create policy "Users can view items in their projects"
  on "public"."items"
  as permissive
  for select
  to authenticated
using ((project_id IN ( SELECT user_roles.project_id
   FROM user_roles
  WHERE ((user_roles.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles.is_active = true)))));



  create policy "Users can create order items in their projects"
  on "public"."order_items"
  as permissive
  for insert
  to authenticated
with check ((order_id IN ( SELECT o.id
   FROM (orders o
     JOIN user_roles ur ON ((o.project_id = ur.project_id)))
  WHERE ((ur.user_id = ( SELECT auth.uid() AS uid)) AND (ur.is_active = true)))));



  create policy "Users can delete order items in their projects"
  on "public"."order_items"
  as permissive
  for delete
  to authenticated
using ((order_id IN ( SELECT o.id
   FROM (orders o
     JOIN user_roles ur ON ((o.project_id = ur.project_id)))
  WHERE ((ur.user_id = ( SELECT auth.uid() AS uid)) AND (ur.is_active = true)))));



  create policy "Users can update order items in their projects"
  on "public"."order_items"
  as permissive
  for update
  to authenticated
using ((order_id IN ( SELECT o.id
   FROM (orders o
     JOIN user_roles ur ON ((o.project_id = ur.project_id)))
  WHERE ((ur.user_id = ( SELECT auth.uid() AS uid)) AND (ur.is_active = true)))))
with check ((order_id IN ( SELECT o.id
   FROM (orders o
     JOIN user_roles ur ON ((o.project_id = ur.project_id)))
  WHERE ((ur.user_id = ( SELECT auth.uid() AS uid)) AND (ur.is_active = true)))));



  create policy "Users can view order items in their projects"
  on "public"."order_items"
  as permissive
  for select
  to authenticated
using ((order_id IN ( SELECT o.id
   FROM (orders o
     JOIN user_roles ur ON ((o.project_id = ur.project_id)))
  WHERE ((ur.user_id = ( SELECT auth.uid() AS uid)) AND (ur.is_active = true)))));



  create policy "Users can create orders in their projects"
  on "public"."orders"
  as permissive
  for insert
  to authenticated
with check ((project_id IN ( SELECT user_roles.project_id
   FROM user_roles
  WHERE ((user_roles.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles.is_active = true)))));



  create policy "Users can delete orders in their projects"
  on "public"."orders"
  as permissive
  for delete
  to authenticated
using ((project_id IN ( SELECT user_roles.project_id
   FROM user_roles
  WHERE ((user_roles.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles.is_active = true)))));



  create policy "Users can update orders in their projects"
  on "public"."orders"
  as permissive
  for update
  to authenticated
using ((project_id IN ( SELECT user_roles.project_id
   FROM user_roles
  WHERE ((user_roles.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles.is_active = true)))))
with check ((project_id IN ( SELECT user_roles.project_id
   FROM user_roles
  WHERE ((user_roles.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles.is_active = true)))));



  create policy "Users can view orders in their projects"
  on "public"."orders"
  as permissive
  for select
  to authenticated
using ((project_id IN ( SELECT user_roles.project_id
   FROM user_roles
  WHERE ((user_roles.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles.is_active = true)))));



  create policy "Admins can create new projects"
  on "public"."projects"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Admins can delete their projects"
  on "public"."projects"
  as permissive
  for delete
  to authenticated
using ((id IN ( SELECT user_roles.project_id
   FROM user_roles
  WHERE ((user_roles.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles.role = 'admin'::user_role_enum) AND (user_roles.is_active = true)))));



  create policy "Admins can update their projects"
  on "public"."projects"
  as permissive
  for update
  to authenticated
using ((id IN ( SELECT user_roles.project_id
   FROM user_roles
  WHERE ((user_roles.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles.role = 'admin'::user_role_enum) AND (user_roles.is_active = true)))))
with check ((id IN ( SELECT user_roles.project_id
   FROM user_roles
  WHERE ((user_roles.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles.role = 'admin'::user_role_enum) AND (user_roles.is_active = true)))));



  create policy "Users can view their accessible projects"
  on "public"."projects"
  as permissive
  for select
  to authenticated
using ((id IN ( SELECT user_roles.project_id
   FROM user_roles
  WHERE ((user_roles.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles.is_active = true)))));



  create policy "Users can create stock movements in their projects"
  on "public"."stock_movements"
  as permissive
  for insert
  to authenticated
with check ((item_id IN ( SELECT i.id
   FROM (items i
     JOIN user_roles ur ON ((i.project_id = ur.project_id)))
  WHERE ((ur.user_id = ( SELECT auth.uid() AS uid)) AND (ur.is_active = true)))));



  create policy "Users can delete stock movements in their projects"
  on "public"."stock_movements"
  as permissive
  for delete
  to authenticated
using ((item_id IN ( SELECT i.id
   FROM (items i
     JOIN user_roles ur ON ((i.project_id = ur.project_id)))
  WHERE ((ur.user_id = ( SELECT auth.uid() AS uid)) AND (ur.is_active = true)))));



  create policy "Users can update stock movements in their projects"
  on "public"."stock_movements"
  as permissive
  for update
  to authenticated
using ((item_id IN ( SELECT i.id
   FROM (items i
     JOIN user_roles ur ON ((i.project_id = ur.project_id)))
  WHERE ((ur.user_id = ( SELECT auth.uid() AS uid)) AND (ur.is_active = true)))))
with check ((item_id IN ( SELECT i.id
   FROM (items i
     JOIN user_roles ur ON ((i.project_id = ur.project_id)))
  WHERE ((ur.user_id = ( SELECT auth.uid() AS uid)) AND (ur.is_active = true)))));



  create policy "Users can view stock movements in their projects"
  on "public"."stock_movements"
  as permissive
  for select
  to authenticated
using ((item_id IN ( SELECT i.id
   FROM (items i
     JOIN user_roles ur ON ((i.project_id = ur.project_id)))
  WHERE ((ur.user_id = ( SELECT auth.uid() AS uid)) AND (ur.is_active = true)))));



  create policy "Admins can add users to their projects"
  on "public"."user_roles"
  as permissive
  for insert
  to authenticated
with check ((project_id IN ( SELECT user_roles_1.project_id
   FROM user_roles user_roles_1
  WHERE ((user_roles_1.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles_1.role = 'admin'::user_role_enum) AND (user_roles_1.is_active = true)))));



  create policy "Admins can remove users from their projects"
  on "public"."user_roles"
  as permissive
  for delete
  to authenticated
using ((project_id IN ( SELECT user_roles_1.project_id
   FROM user_roles user_roles_1
  WHERE ((user_roles_1.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles_1.role = 'admin'::user_role_enum) AND (user_roles_1.is_active = true)))));



  create policy "Admins can update user roles in their projects"
  on "public"."user_roles"
  as permissive
  for update
  to authenticated
using ((project_id IN ( SELECT user_roles_1.project_id
   FROM user_roles user_roles_1
  WHERE ((user_roles_1.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles_1.role = 'admin'::user_role_enum) AND (user_roles_1.is_active = true)))))
with check ((project_id IN ( SELECT user_roles_1.project_id
   FROM user_roles user_roles_1
  WHERE ((user_roles_1.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles_1.role = 'admin'::user_role_enum) AND (user_roles_1.is_active = true)))));



  create policy "Users can view roles in their projects"
  on "public"."user_roles"
  as permissive
  for select
  to authenticated
using ((project_id IN ( SELECT user_roles_1.project_id
   FROM user_roles user_roles_1
  WHERE ((user_roles_1.user_id = ( SELECT auth.uid() AS uid)) AND (user_roles_1.is_active = true)))));


CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_addresses_updated_at BEFORE UPDATE ON public.customer_addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_item_prices_updated_at BEFORE UPDATE ON public.item_prices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON public.items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stock_on_order_confirm AFTER UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_item_stock();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


