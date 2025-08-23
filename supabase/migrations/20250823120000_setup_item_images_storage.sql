-- Create storage bucket and policies for item images
-- Migration: 20250823120000_setup_item_images_storage.sql

-- Create a bucket for item images (public for product catalog)
INSERT INTO storage.buckets (id, name, public)
VALUES ('item-images', 'item-images', true)
ON CONFLICT (id) DO UPDATE SET
public = true;

-- Create simpler, more reliable policies for item images
-- Allow authenticated users to upload images (project access checked in application layer)
DROP POLICY IF EXISTS "Users can upload item images for their projects" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload item images" ON storage.objects;
CREATE POLICY "Authenticated users can upload item images" ON storage.objects
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'item-images');

-- Allow authenticated users to view item images
DROP POLICY IF EXISTS "Users can view item images for their projects" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view item images" ON storage.objects;
CREATE POLICY "Authenticated users can view item images" ON storage.objects
FOR SELECT 
TO authenticated 
USING (bucket_id = 'item-images');

-- Allow authenticated users to delete item images (project access checked in application layer)
DROP POLICY IF EXISTS "Users can delete item images for their projects" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete item images" ON storage.objects;
CREATE POLICY "Authenticated users can delete item images" ON storage.objects
FOR DELETE 
TO authenticated 
USING (bucket_id = 'item-images');

-- Allow public read access to item images (for public catalog/sharing)
DROP POLICY IF EXISTS "Public read access to item images" ON storage.objects;
CREATE POLICY "Public read access to item images" ON storage.objects
FOR SELECT 
TO public 
USING (bucket_id = 'item-images');
