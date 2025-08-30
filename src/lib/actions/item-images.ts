'use server';

import { createClient } from '@/lib/supabase/server';
import { createItemImage, deleteItemImage, getItemImages } from '@/lib/data/items';
import { uploadItemImage, deleteAssetFile, extractFilePathFromUrl, validateProjectAccess } from '@/lib/utils/assets-storage';
import { revalidatePath } from 'next/cache';
import type { Tables } from '@/lib/supabase/database.types';

interface UploadImageResult {
  success: boolean;
  data?: {
    id: string;
    image_url: string;
    alt_text?: string;
  };
  error?: string;
}

interface DeleteImageResult {
  success: boolean;
  error?: string;
}

// Upload a single image for an item
export async function uploadItemImageAction(
  itemId: string,
  projectId: string,
  file: File,
  altText?: string,
  isPrimary = false,
): Promise<UploadImageResult> {
  try {
    const supabase = await createClient();
    
    // Validate project access
    const accessCheck = await validateProjectAccess(projectId);
    if (!accessCheck.success) {
      return { success: false, error: accessCheck.error || 'Access denied' };
    }

    // Check current image count
    const existingImages = await getItemImages(itemId);
    if (existingImages.success && existingImages.data && existingImages.data.length >= 5) {
      return {
        success: false,
        error: 'Maximum of 5 images per item allowed.',
      };
    }

    // Upload to assets bucket
    const uploadResult = await uploadItemImage(projectId, itemId, file);
    if (!uploadResult.success) {
      return {
        success: false,
        error: uploadResult.error,
      };
    }

    const publicUrl = uploadResult.data!.publicUrl;

    // If this is set as primary, make sure no other images are primary
    if (isPrimary) {
      const existingImages = await getItemImages(itemId);
      if (existingImages.success && existingImages.data) {
        // Update existing primary image to not be primary
        const currentPrimary = existingImages.data.find(
          (img: Tables<'item_images'>) => img.is_primary,
        );
        if (currentPrimary) {
          await supabase
            .from('item_images')
            .update({ is_primary: false })
            .eq('id', currentPrimary.id);
        }
      }
    }

    // Save image record to database
    const imageResult = await createItemImage({
      item_id: itemId,
      image_url: publicUrl,
      alt_text: altText || null,
      is_primary: isPrimary,
      display_order: 0, // Will be handled by the frontend for ordering
    });

    if (imageResult.success && imageResult.data) {
      revalidatePath(`/dashboard/${projectId}/items`);
      return {
        success: true,
        data: {
          id: imageResult.data.id,
          image_url: imageResult.data.image_url,
          alt_text: imageResult.data.alt_text || undefined,
        },
      };
    } else {
      return { success: false, error: 'Failed to save image record' };
    }
  } catch {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Delete an item image
export async function deleteItemImageAction(
  imageId: string,
  projectId: string,
): Promise<DeleteImageResult> {
  try {
    // Validate project access
    const accessCheck = await validateProjectAccess(projectId);
    if (!accessCheck.success) {
      return { success: false, error: accessCheck.error || 'Access denied' };
    }

    const supabase = await createClient();

    // Get image record first to get the storage path and check if it's primary
    const { data: image } = await supabase
      .from('item_images')
      .select('image_url, is_primary, item_id')
      .eq('id', imageId)
      .single();

    if (!image) {
      return { success: false, error: 'Image not found' };
    }

    // Extract file path from URL for the assets bucket
    const filePath = extractFilePathFromUrl(image.image_url);

    // Delete from database first
    const deleteResult = await deleteItemImage(imageId);
    if (!deleteResult.success) {
      return { success: false, error: 'Failed to delete image record' };
    }

    // Check if the deleted image was primary and promote another image if needed
    if (image.is_primary) {
      const promotionResult = await promotePrimaryImageAction(image.item_id);
      
      if (!promotionResult.success) {
        // Primary image promotion failed, but we continue since the deletion succeeded
      }
    }

    // Delete from assets bucket storage if we have a valid path
    if (filePath) {
      const storageResult = await deleteAssetFile(filePath);
      if (!storageResult.success) {
        // Storage deletion failed, but the database record is already gone
      }
    }

    revalidatePath(`/dashboard/${projectId}/items`);
    return { success: true };
  } catch {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Bulk upload multiple images for an item
export async function uploadMultipleItemImagesAction(
  itemId: string,
  projectId: string,
  files: File[],
): Promise<{ success: boolean; results: UploadImageResult[]; error?: string }> {
  try {
    const results: UploadImageResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isPrimary = i === 0 && results.length === 0; // First successful upload becomes primary

      const result = await uploadItemImageAction(itemId, projectId, file, undefined, isPrimary);
      results.push(result);

      // Stop if we encounter an error (optional - could continue uploading others)
      if (!result.success) {
        // Upload failed, but we continue with other files
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const hasErrors = results.some((r) => !r.success);

    return {
      success: successCount > 0,
      results,
      error: hasErrors ? `${results.length - successCount} uploads failed` : undefined,
    };
  } catch {
    return {
      success: false,
      results: [],
      error: 'An unexpected error occurred during bulk upload',
    };
  }
}

// Get all images for an item (server action wrapper)
export async function getItemImagesAction(itemId: string) {
  return await getItemImages(itemId);
}

/**
 * Promote the next available image to primary for an item
 * Used when the current primary image is deleted
 */
export async function promotePrimaryImageAction(
  itemId: string,
): Promise<{ success: boolean; promotedImageId?: string; error?: string }> {
  try {
    const remainingImages = await getItemImages(itemId);
    
    if (!remainingImages.success || !remainingImages.data || remainingImages.data.length === 0) {
      return { success: true }; // No images left, nothing to promote
    }

    // Find the best candidate for primary (by display_order, then by created_at)
    const nextPrimary = remainingImages.data
      .sort((a, b) => {
        const orderA = a.display_order || 999;
        const orderB = b.display_order || 999;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime();
      })[0];
    
    if (nextPrimary) {
      const supabase = await createClient();
      
      const { error } = await supabase
        .from('item_images')
        .update({ is_primary: true })
        .eq('id', nextPrimary.id);
      
      if (error) {
        return { success: false, error: 'Failed to promote image to primary' };
      }
      
      return { success: true, promotedImageId: nextPrimary.id };
    }
    
    return { success: true };
  } catch {
    return { success: false, error: 'An unexpected error occurred' };
  }
}
