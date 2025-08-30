import 'server-only';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';

/**
 * Assets storage utilities for the new 'assets' bucket
 * Handles item images and QR codes with proper folder organization
 */

// Allowed file types and size limits
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE = 1024 * 1024; // 1MB for item images
const MAX_QR_SIZE = 5 * 1024 * 1024; // 5MB for QR codes

export interface UploadResult {
  success: boolean;
  error?: string;
  data?: {
    fileName: string;
    publicUrl: string;
    filePath: string;
  };
}

/**
 * Generate a unique filename for uploaded files
 */
function generateUniqueFileName(originalName: string, prefix?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  const filePrefix = prefix ? `${prefix}-` : '';
  return `${filePrefix}${timestamp}-${random}.${extension}`;
}

/**
 * Upload an item image to the assets bucket
 */
export async function uploadItemImage(
  projectId: string,
  itemId: string,
  file: File,
): Promise<UploadResult> {
  try {
    const supabase = await createClient();
    const supabaseAdmin = await createServiceRoleClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Authentication required' };
    }

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
      };
    }

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      return {
        success: false,
        error: 'File size must be less than 1MB.',
      };
    }

    // Generate unique filename
    const fileName = generateUniqueFileName(file.name, itemId);
    const filePath = `item-images/${projectId}/${itemId}/${fileName}`;

    // Upload to the assets bucket
    const { error: uploadError } = await supabaseAdmin.storage
      .from('assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return {
        success: false,
        error: `Failed to upload image: ${uploadError.message}`,
      };
    }

    // Get public URL from the assets bucket
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from('assets').getPublicUrl(filePath);

    return {
      success: true,
      data: {
        fileName,
        publicUrl,
        filePath,
      },
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload image',
    };
  }
}

/**
 * Upload a QR code image to the assets bucket
 */
export async function uploadQRCode(
  projectId: string,
  paymentMethod: string,
  file: File,
): Promise<UploadResult> {
  try {
    const supabase = await createClient();
    const supabaseAdmin = await createServiceRoleClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Authentication required' };
    }

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
      };
    }

    // Validate file size
    if (file.size > MAX_QR_SIZE) {
      return {
        success: false,
        error: 'File size must be less than 5MB.',
      };
    }

    // Generate unique filename
    const fileName = generateUniqueFileName(file.name, paymentMethod);
    const filePath = `qr-codes/${projectId}/${paymentMethod}/${fileName}`;

    // Upload to the assets bucket
    const { error: uploadError } = await supabaseAdmin.storage
      .from('assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return {
        success: false,
        error: `Failed to upload QR code: ${uploadError.message}`,
      };
    }

    // Get public URL from the assets bucket
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from('assets').getPublicUrl(filePath);

    return {
      success: true,
      data: {
        fileName,
        publicUrl,
        filePath,
      },
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload QR code',
    };
  }
}

/**
 * Delete a file from the assets bucket
 */
export async function deleteAssetFile(filePath: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabaseAdmin = await createServiceRoleClient();

    const { error: deleteError } = await supabaseAdmin.storage.from('assets').remove([filePath]);

    if (deleteError) {
      console.error('Storage deletion error:', deleteError);
      return {
        success: false,
        error: deleteError.message,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete file',
    };
  }
}

/**
 * Delete all item images from assets bucket
 */
export async function deleteAllItemImages(
  projectId: string,
  itemId: string,
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabaseAdmin = await createServiceRoleClient();

    // List all files in the item's folder
    const { data: files, error: listError } = await supabaseAdmin.storage
      .from('assets')
      .list(`item-images/${projectId}/${itemId}`);

    if (listError) {
      console.error('List files error:', listError);
      return {
        success: false,
        error: listError.message,
      };
    }

    if (!files || files.length === 0) {
      return { success: true }; // No files to delete
    }

    // Delete all files
    const filePaths = files.map((file) => `item-images/${projectId}/${itemId}/${file.name}`);
    const { error: deleteError } = await supabaseAdmin.storage.from('assets').remove(filePaths);

    if (deleteError) {
      console.error('Storage deletion error:', deleteError);
      return {
        success: false,
        error: deleteError.message,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete all item images error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete item images',
    };
  }
}

/**
 * Extract file path from a public URL
 */
export function extractFilePathFromUrl(publicUrl: string): string | null {
  try {
    const url = new URL(publicUrl);
    const pathSegments = url.pathname.split('/');

    // Find the 'assets' segment and get everything after it
    const assetsIndex = pathSegments.findIndex((segment) => segment === 'assets');
    if (assetsIndex === -1 || assetsIndex === pathSegments.length - 1) {
      return null;
    }

    // Return the path within the assets bucket
    return pathSegments.slice(assetsIndex + 1).join('/');
  } catch (error) {
    console.error('Error extracting file path from URL:', error);
    return null;
  }
}

/**
 * Validate if the current user has access to a project
 */
export async function validateProjectAccess(
  projectId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Authentication required' };
    }

    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('project_id', projectId)
      .eq('is_active', true)
      .single();

    if (!userRole) {
      return { success: false, error: 'No access to this project' };
    }

    return { success: true };
  } catch (error) {
    console.error('Project access validation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to validate project access',
    };
  }
}
