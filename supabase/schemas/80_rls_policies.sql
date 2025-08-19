-- Row Level Security policies for all tables
-- File: 80_rls_policies.sql
-- This file contains all RLS policies and runs after all tables are created

-- ========================================
-- PROJECTS TABLE POLICIES
-- ========================================
create policy "Users can view their accessible projects" on projects
for select
to authenticated
using (
    id in (
        select project_id from user_roles 
        where user_id = (select auth.uid()) and is_active = true
    )
);

create policy "Admins can create new projects" on projects
for insert
to authenticated
with check (true); -- Any authenticated user can create a project

create policy "Admins can update their projects" on projects
for update
to authenticated
using (
    id in (
        select project_id from user_roles 
        where user_id = (select auth.uid()) and role = 'admin' and is_active = true
    )
)
with check (
    id in (
        select project_id from user_roles 
        where user_id = (select auth.uid()) and role = 'admin' and is_active = true
    )
);

create policy "Admins can delete their projects" on projects
for delete
to authenticated
using (
    id in (
        select project_id from user_roles 
        where user_id = (select auth.uid()) and role = 'admin' and is_active = true
    )
);

-- ========================================
-- USER ROLES TABLE POLICIES
-- ========================================
create policy "Users can view roles in their projects" on user_roles
for select
to authenticated
using (
    project_id in (
        select project_id from user_roles 
        where user_id = (select auth.uid()) and is_active = true
    )
);

create policy "Admins can add users to their projects" on user_roles
for insert
to authenticated
with check (
    project_id in (
        select project_id from user_roles 
        where user_id = (select auth.uid()) and role = 'admin' and is_active = true
    )
);

create policy "Admins can update user roles in their projects" on user_roles
for update
to authenticated
using (
    project_id in (
        select project_id from user_roles 
        where user_id = (select auth.uid()) and role = 'admin' and is_active = true
    )
)
with check (
    project_id in (
        select project_id from user_roles 
        where user_id = (select auth.uid()) and role = 'admin' and is_active = true
    )
);

create policy "Admins can remove users from their projects" on user_roles
for delete
to authenticated
using (
    project_id in (
        select project_id from user_roles 
        where user_id = (select auth.uid()) and role = 'admin' and is_active = true
    )
);

-- ========================================
-- CATEGORIES TABLE POLICIES
-- ========================================
create policy "Users can view categories in their projects" on categories
for select
to authenticated
using (
    project_id in (
        select project_id from user_roles 
        where user_id = (select auth.uid()) and is_active = true
    )
);

create policy "Users can create categories in their projects" on categories
for insert
to authenticated
with check (
    project_id in (
        select project_id from user_roles 
        where user_id = (select auth.uid()) and is_active = true
    )
);

create policy "Users can update categories in their projects" on categories
for update
to authenticated
using (
    project_id in (
        select project_id from user_roles 
        where user_id = (select auth.uid()) and is_active = true
    )
)
with check (
    project_id in (
        select project_id from user_roles 
        where user_id = (select auth.uid()) and is_active = true
    )
);

create policy "Users can delete categories in their projects" on categories
for delete
to authenticated
using (
    project_id in (
        select project_id from user_roles 
        where user_id = (select auth.uid()) and is_active = true
    )
);

-- ========================================
-- ITEMS TABLE POLICIES
-- ========================================
create policy "Users can view items in their projects" on items
for select
to authenticated
using (
    project_id in (
        select project_id from user_roles 
        where user_id = (select auth.uid()) and is_active = true
    )
);

create policy "Users can create items in their projects" on items
for insert
to authenticated
with check (
    project_id in (
        select project_id from user_roles 
        where user_id = (select auth.uid()) and is_active = true
    )
);

create policy "Users can update items in their projects" on items
for update
to authenticated
using (
    project_id in (
        select project_id from user_roles 
        where user_id = (select auth.uid()) and is_active = true
    )
)
with check (
    project_id in (
        select project_id from user_roles 
        where user_id = (select auth.uid()) and is_active = true
    )
);

create policy "Users can delete items in their projects" on items
for delete
to authenticated
using (
    project_id in (
        select project_id from user_roles 
        where user_id = (select auth.uid()) and is_active = true
    )
);

-- ========================================
-- ITEM PRICES TABLE POLICIES
-- ========================================
create policy "Users can view item prices in their projects" on item_prices
for select
to authenticated
using (
    item_id in (
        select i.id from items i
        join user_roles ur on i.project_id = ur.project_id
        where ur.user_id = (select auth.uid()) and ur.is_active = true
    )
);

create policy "Users can create item prices in their projects" on item_prices
for insert
to authenticated
with check (
    item_id in (
        select i.id from items i
        join user_roles ur on i.project_id = ur.project_id
        where ur.user_id = (select auth.uid()) and ur.is_active = true
    )
);

create policy "Users can update item prices in their projects" on item_prices
for update
to authenticated
using (
    item_id in (
        select i.id from items i
        join user_roles ur on i.project_id = ur.project_id
        where ur.user_id = (select auth.uid()) and ur.is_active = true
    )
)
with check (
    item_id in (
        select i.id from items i
        join user_roles ur on i.project_id = ur.project_id
        where ur.user_id = (select auth.uid()) and ur.is_active = true
    )
);

create policy "Users can delete item prices in their projects" on item_prices
for delete
to authenticated
using (
    item_id in (
        select i.id from items i
        join user_roles ur on i.project_id = ur.project_id
        where ur.user_id = (select auth.uid()) and ur.is_active = true
    )
);

-- ========================================
-- ITEM IMAGES TABLE POLICIES
-- ========================================
create policy "Users can view item images in their projects" on item_images
for select
to authenticated
using (
    item_id in (
        select i.id from items i
        join user_roles ur on i.project_id = ur.project_id
        where ur.user_id = (select auth.uid()) and ur.is_active = true
    )
);

create policy "Users can create item images in their projects" on item_images
for insert
to authenticated
with check (
    item_id in (
        select i.id from items i
        join user_roles ur on i.project_id = ur.project_id
        where ur.user_id = (select auth.uid()) and ur.is_active = true
    )
);

create policy "Users can update item images in their projects" on item_images
for update
to authenticated
using (
    item_id in (
        select i.id from items i
        join user_roles ur on i.project_id = ur.project_id
        where ur.user_id = (select auth.uid()) and ur.is_active = true
    )
)
with check (
    item_id in (
        select i.id from items i
        join user_roles ur on i.project_id = ur.project_id
        where ur.user_id = (select auth.uid()) and ur.is_active = true
    )
);

create policy "Users can delete item images in their projects" on item_images
for delete
to authenticated
using (
    item_id in (
        select i.id from items i
        join user_roles ur on i.project_id = ur.project_id
        where ur.user_id = (select auth.uid()) and ur.is_active = true
    )
);

-- ========================================
-- CUSTOMERS TABLE POLICIES
-- ========================================
create policy "Users can view customers in their projects" on customers
for select
to authenticated
using (
    project_id in (
        select project_id from user_roles 
        where user_id = (select auth.uid()) and is_active = true
    )
);

create policy "Users can create customers in their projects" on customers
for insert
to authenticated
with check (
    project_id in (
        select project_id from user_roles 
        where user_id = (select auth.uid()) and is_active = true
    )
);

create policy "Users can update customers in their projects" on customers
for update
to authenticated
using (
    project_id in (
        select project_id from user_roles 
        where user_id = (select auth.uid()) and is_active = true
    )
)
with check (
    project_id in (
        select project_id from user_roles 
        where user_id = (select auth.uid()) and is_active = true
    )
);

create policy "Users can delete customers in their projects" on customers
for delete
to authenticated
using (
    project_id in (
        select project_id from user_roles 
        where user_id = (select auth.uid()) and is_active = true
    )
);

-- ========================================
-- CUSTOMER ADDRESSES TABLE POLICIES
-- ========================================
create policy "Users can view customer addresses in their projects" on customer_addresses
for select
to authenticated
using (
    customer_id in (
        select c.id from customers c
        join user_roles ur on c.project_id = ur.project_id
        where ur.user_id = (select auth.uid()) and ur.is_active = true
    )
);

create policy "Users can create customer addresses in their projects" on customer_addresses
for insert
to authenticated
with check (
    customer_id in (
        select c.id from customers c
        join user_roles ur on c.project_id = ur.project_id
        where ur.user_id = (select auth.uid()) and ur.is_active = true
    )
);

create policy "Users can update customer addresses in their projects" on customer_addresses
for update
to authenticated
using (
    customer_id in (
        select c.id from customers c
        join user_roles ur on c.project_id = ur.project_id
        where ur.user_id = (select auth.uid()) and ur.is_active = true
    )
)
with check (
    customer_id in (
        select c.id from customers c
        join user_roles ur on c.project_id = ur.project_id
        where ur.user_id = (select auth.uid()) and ur.is_active = true
    )
);

create policy "Users can delete customer addresses in their projects" on customer_addresses
for delete
to authenticated
using (
    customer_id in (
        select c.id from customers c
        join user_roles ur on c.project_id = ur.project_id
        where ur.user_id = (select auth.uid()) and ur.is_active = true
    )
);

-- ========================================
-- ORDERS TABLE POLICIES
-- ========================================
create policy "Users can view orders in their projects" on orders
for select
to authenticated
using (
    project_id in (
        select project_id from user_roles 
        where user_id = (select auth.uid()) and is_active = true
    )
);

create policy "Users can create orders in their projects" on orders
for insert
to authenticated
with check (
    project_id in (
        select project_id from user_roles 
        where user_id = (select auth.uid()) and is_active = true
    )
);

create policy "Users can update orders in their projects" on orders
for update
to authenticated
using (
    project_id in (
        select project_id from user_roles 
        where user_id = (select auth.uid()) and is_active = true
    )
)
with check (
    project_id in (
        select project_id from user_roles 
        where user_id = (select auth.uid()) and is_active = true
    )
);

create policy "Users can delete orders in their projects" on orders
for delete
to authenticated
using (
    project_id in (
        select project_id from user_roles 
        where user_id = (select auth.uid()) and is_active = true
    )
);

-- ========================================
-- ORDER ITEMS TABLE POLICIES
-- ========================================
create policy "Users can view order items in their projects" on order_items
for select
to authenticated
using (
    order_id in (
        select o.id from orders o
        join user_roles ur on o.project_id = ur.project_id
        where ur.user_id = (select auth.uid()) and ur.is_active = true
    )
);

create policy "Users can create order items in their projects" on order_items
for insert
to authenticated
with check (
    order_id in (
        select o.id from orders o
        join user_roles ur on o.project_id = ur.project_id
        where ur.user_id = (select auth.uid()) and ur.is_active = true
    )
);

create policy "Users can update order items in their projects" on order_items
for update
to authenticated
using (
    order_id in (
        select o.id from orders o
        join user_roles ur on o.project_id = ur.project_id
        where ur.user_id = (select auth.uid()) and ur.is_active = true
    )
)
with check (
    order_id in (
        select o.id from orders o
        join user_roles ur on o.project_id = ur.project_id
        where ur.user_id = (select auth.uid()) and ur.is_active = true
    )
);

create policy "Users can delete order items in their projects" on order_items
for delete
to authenticated
using (
    order_id in (
        select o.id from orders o
        join user_roles ur on o.project_id = ur.project_id
        where ur.user_id = (select auth.uid()) and ur.is_active = true
    )
);

-- ========================================
-- INVOICES TABLE POLICIES
-- ========================================
create policy "Users can view invoices in their projects" on invoices
for select
to authenticated
using (
    project_id in (
        select project_id from user_roles 
        where user_id = (select auth.uid()) and is_active = true
    )
);

create policy "Users can create invoices in their projects" on invoices
for insert
to authenticated
with check (
    project_id in (
        select project_id from user_roles 
        where user_id = (select auth.uid()) and is_active = true
    )
);

create policy "Users can update invoices in their projects" on invoices
for update
to authenticated
using (
    project_id in (
        select project_id from user_roles 
        where user_id = (select auth.uid()) and is_active = true
    )
)
with check (
    project_id in (
        select project_id from user_roles 
        where user_id = (select auth.uid()) and is_active = true
    )
);

create policy "Users can delete invoices in their projects" on invoices
for delete
to authenticated
using (
    project_id in (
        select project_id from user_roles 
        where user_id = (select auth.uid()) and is_active = true
    )
);

-- ========================================
-- CART ITEMS TABLE POLICIES
-- ========================================
create policy "Users can view cart items in their projects" on cart_items
for select
to authenticated
using (
    customer_id in (
        select c.id from customers c
        join user_roles ur on c.project_id = ur.project_id
        where ur.user_id = (select auth.uid()) and ur.is_active = true
    )
);

create policy "Users can create cart items in their projects" on cart_items
for insert
to authenticated
with check (
    customer_id in (
        select c.id from customers c
        join user_roles ur on c.project_id = ur.project_id
        where ur.user_id = (select auth.uid()) and ur.is_active = true
    )
);

create policy "Users can update cart items in their projects" on cart_items
for update
to authenticated
using (
    customer_id in (
        select c.id from customers c
        join user_roles ur on c.project_id = ur.project_id
        where ur.user_id = (select auth.uid()) and ur.is_active = true
    )
)
with check (
    customer_id in (
        select c.id from customers c
        join user_roles ur on c.project_id = ur.project_id
        where ur.user_id = (select auth.uid()) and ur.is_active = true
    )
);

create policy "Users can delete cart items in their projects" on cart_items
for delete
to authenticated
using (
    customer_id in (
        select c.id from customers c
        join user_roles ur on c.project_id = ur.project_id
        where ur.user_id = (select auth.uid()) and ur.is_active = true
    )
);

-- ========================================
-- CHAT MESSAGES TABLE POLICIES
-- ========================================
create policy "Users can view chat messages in their projects" on chat_messages
for select
to authenticated
using (
    project_id in (
        select project_id from user_roles 
        where user_id = (select auth.uid()) and is_active = true
    )
);

create policy "Users can create chat messages in their projects" on chat_messages
for insert
to authenticated
with check (
    project_id in (
        select project_id from user_roles 
        where user_id = (select auth.uid()) and is_active = true
    )
);

create policy "Users can update chat messages in their projects" on chat_messages
for update
to authenticated
using (
    project_id in (
        select project_id from user_roles 
        where user_id = (select auth.uid()) and is_active = true
    )
)
with check (
    project_id in (
        select project_id from user_roles 
        where user_id = (select auth.uid()) and is_active = true
    )
);

create policy "Users can delete chat messages in their projects" on chat_messages
for delete
to authenticated
using (
    project_id in (
        select project_id from user_roles 
        where user_id = (select auth.uid()) and is_active = true
    )
);

-- ========================================
-- STOCK MOVEMENTS TABLE POLICIES
-- ========================================
create policy "Users can view stock movements in their projects" on stock_movements
for select
to authenticated
using (
    item_id in (
        select i.id from items i
        join user_roles ur on i.project_id = ur.project_id
        where ur.user_id = (select auth.uid()) and ur.is_active = true
    )
);

create policy "Users can create stock movements in their projects" on stock_movements
for insert
to authenticated
with check (
    item_id in (
        select i.id from items i
        join user_roles ur on i.project_id = ur.project_id
        where ur.user_id = (select auth.uid()) and ur.is_active = true
    )
);

create policy "Users can update stock movements in their projects" on stock_movements
for update
to authenticated
using (
    item_id in (
        select i.id from items i
        join user_roles ur on i.project_id = ur.project_id
        where ur.user_id = (select auth.uid()) and ur.is_active = true
    )
)
with check (
    item_id in (
        select i.id from items i
        join user_roles ur on i.project_id = ur.project_id
        where ur.user_id = (select auth.uid()) and ur.is_active = true
    )
);

create policy "Users can delete stock movements in their projects" on stock_movements
for delete
to authenticated
using (
    item_id in (
        select i.id from items i
        join user_roles ur on i.project_id = ur.project_id
        where ur.user_id = (select auth.uid()) and ur.is_active = true
    )
);
