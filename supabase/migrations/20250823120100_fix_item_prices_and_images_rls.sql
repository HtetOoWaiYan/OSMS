-- Fix item_prices trigger and item_images RLS policies
-- Migration: 20250823120100_fix_item_prices_and_images_rls.sql

-- 1. Add updated_at column to item_prices table (needed by trigger)
ALTER TABLE item_prices ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone default now();

-- 2. Add RLS policies for item_images table to allow server-side operations
CREATE POLICY "Allow authenticated users to insert item images" ON item_images
FOR INSERT 
TO authenticated 
WITH CHECK (
    item_id IN (
        SELECT i.id FROM items i
        JOIN user_roles ur ON i.project_id = ur.project_id
        WHERE ur.user_id = (SELECT auth.uid()) AND ur.is_active = true
    )
);

CREATE POLICY "Allow authenticated users to update item images" ON item_images
FOR UPDATE 
TO authenticated 
USING (
    item_id IN (
        SELECT i.id FROM items i
        JOIN user_roles ur ON i.project_id = ur.project_id
        WHERE ur.user_id = (SELECT auth.uid()) AND ur.is_active = true
    )
)
WITH CHECK (
    item_id IN (
        SELECT i.id FROM items i
        JOIN user_roles ur ON i.project_id = ur.project_id
        WHERE ur.user_id = (SELECT auth.uid()) AND ur.is_active = true
    )
);

CREATE POLICY "Allow authenticated users to delete item images" ON item_images
FOR DELETE 
TO authenticated 
USING (
    item_id IN (
        SELECT i.id FROM items i
        JOIN user_roles ur ON i.project_id = ur.project_id
        WHERE ur.user_id = (SELECT auth.uid()) AND ur.is_active = true
    )
);

-- 3. Add service role policies to allow server-side operations with service role client
CREATE POLICY "Service role full access to item_images" ON item_images
FOR ALL 
TO service_role 
USING (true)
WITH CHECK (true);
