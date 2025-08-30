-- Row Level Security policies for all tables
-- File: 80_rls_policies.sql
-- This file contains ONLY SELECT policies for client-side data access
-- All mutations (INSERT, UPDATE, DELETE) are handled server-side with service role client

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

-- ========================================
-- USER ROLES TABLE POLICIES  
-- ========================================
create policy "Users can view their own roles" on user_roles
for select
to authenticated
using (
    user_id = (select auth.uid())
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

-- ========================================
-- CART ITEMS TABLE POLICIES
-- ========================================
-- Note: Cart items are typically managed server-side via API
-- but keeping select policy for potential client-side cart display
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

-- ========================================
-- PAYMENT QR CODES TABLE POLICIES
-- ========================================
create policy "Users can view payment QR codes in their projects" on payment_qr_codes
for select
to authenticated
using (
    project_id in (
        select project_id from user_roles 
        where user_id = (select auth.uid()) and is_active = true
    )
);



