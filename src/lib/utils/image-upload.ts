import "server-only";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Image upload utilities for Supabase Storage
 * Handles item image uploads, deletions, and URL generation
 */

// Allowed image types and size limits
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const MAX_IMAGES_PER_ITEM = 5;

/**
 * Generate a unique filename for uploaded images
 */
function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const extension = originalName.split(".").pop()?.toLowerCase() || "jpg";
  return `${timestamp}-${random}.${extension}`;
}

/**
 * Upload an image for an item
 */
export async function uploadItemImage(
  itemId: string,
  file: File,
  altText?: string,
  isPrimary: boolean = false,
): Promise<{
  success: boolean;
  error?: string;
  data?: {
    imageId: string;
    imageUrl: string;
    publicUrl: string;
  };
}> {
  try {
    const supabase = await createClient();
    const supabaseAdmin = await createServiceRoleClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Validate file
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        success: false,
        error:
          "Invalid file type. Only JPEG, PNG, and WebP images are allowed.",
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: "File size must be less than 1MB.",
      };
    }

    // Get item details and check permissions
    const { data: item } = await supabase
      .from("items")
      .select("project_id, name")
      .eq("id", itemId)
      .single();

    if (!item) {
      return { success: false, error: "Item not found or access denied" };
    }

    // Check user permissions
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("project_id", item.project_id)
      .eq("is_active", true)
      .single();

    if (!userRole) {
      return { success: false, error: "No access to this project" };
    }

    // Check current image count
    const { data: existingImages } = await supabase
      .from("item_images")
      .select("id")
      .eq("item_id", itemId);

    if (existingImages && existingImages.length >= MAX_IMAGES_PER_ITEM) {
      return {
        success: false,
        error: `Maximum of ${MAX_IMAGES_PER_ITEM} images per item allowed.`,
      };
    }

    // Generate unique filename
    const fileName = generateUniqueFileName(file.name);
    const filePath = `private/${item.project_id}/${itemId}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from("item-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return {
        success: false,
        error: "Failed to upload image. Please try again.",
      };
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from("item-images")
      .getPublicUrl(filePath);

    // If this is set as primary, unset other primary images first
    if (isPrimary) {
      await supabaseAdmin
        .from("item_images")
        .update({ is_primary: false })
        .eq("item_id", itemId);
    }

    // Get the next display order
    const { data: lastImage } = await supabase
      .from("item_images")
      .select("display_order")
      .eq("item_id", itemId)
      .order("display_order", { ascending: false })
      .limit(1)
      .single();

    const nextOrder = (lastImage?.display_order || 0) + 1;

    // Save image record to database
    const { data: imageRecord, error: dbError } = await supabaseAdmin
      .from("item_images")
      .insert({
        item_id: itemId,
        image_url: publicUrl,
        alt_text: altText || `${item.name} image`,
        display_order: nextOrder,
        is_primary: isPrimary,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);

      // Clean up uploaded file if database insert fails
      await supabaseAdmin.storage
        .from("item-images")
        .remove([filePath]);

      return {
        success: false,
        error: "Failed to save image record. Please try again.",
      };
    }

    return {
      success: true,
      data: {
        imageId: imageRecord.id,
        imageUrl: publicUrl,
        publicUrl,
      },
    };
  } catch (error) {
    console.error("Error uploading image:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload image",
    };
  }
}

/**
 * Delete an item image
 */
export async function deleteItemImage(
  imageId: string,
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const supabaseAdmin = await createServiceRoleClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Get image details and check permissions
    const { data: image } = await supabase
      .from("item_images")
      .select(`
        id,
        image_url,
        item_id,
        items!inner(project_id)
      `)
      .eq("id", imageId)
      .single();

    if (!image) {
      return { success: false, error: "Image not found or access denied" };
    }

    // Check user permissions
    const projectId = (image.items as { project_id: string }).project_id;
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("project_id", projectId)
      .eq("is_active", true)
      .single();

    if (!userRole) {
      return { success: false, error: "No access to this project" };
    }

    // Extract file path from URL
    const url = new URL(image.image_url);
    const pathSegments = url.pathname.split("/");
    const filePath = pathSegments.slice(-4).join("/"); // Extract 'private/project_id/item_id/filename'

    // Delete from storage
    const { error: storageError } = await supabaseAdmin.storage
      .from("item-images")
      .remove([filePath]);

    if (storageError) {
      console.warn(
        "Storage deletion error (continuing with DB deletion):",
        storageError,
      );
    }

    // Delete from database
    const { error: dbError } = await supabaseAdmin
      .from("item_images")
      .delete()
      .eq("id", imageId);

    if (dbError) {
      console.error("Database deletion error:", dbError);
      return {
        success: false,
        error: "Failed to delete image record",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting image:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete image",
    };
  }
}

/**
 * Update image details (alt text, primary status, display order)
 */
export async function updateItemImage(
  imageId: string,
  updates: {
    altText?: string;
    isPrimary?: boolean;
    displayOrder?: number;
  },
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const supabaseAdmin = await createServiceRoleClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Get image details and check permissions
    const { data: image } = await supabase
      .from("item_images")
      .select(`
        id,
        item_id,
        items!inner(project_id)
      `)
      .eq("id", imageId)
      .single();

    if (!image) {
      return { success: false, error: "Image not found or access denied" };
    }

    // Check user permissions
    const projectIdForUpdate =
      (image.items as { project_id: string }).project_id;
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("project_id", projectIdForUpdate)
      .eq("is_active", true)
      .single();

    if (!userRole) {
      return { success: false, error: "No access to this project" };
    }

    // If setting as primary, unset other primary images first
    if (updates.isPrimary === true) {
      await supabaseAdmin
        .from("item_images")
        .update({ is_primary: false })
        .eq("item_id", image.item_id)
        .neq("id", imageId);
    }

    // Update image
    const updateData: Record<string, unknown> = {};
    if (updates.altText !== undefined) updateData.alt_text = updates.altText;
    if (updates.isPrimary !== undefined) {
      updateData.is_primary = updates.isPrimary;
    }
    if (updates.displayOrder !== undefined) {
      updateData.display_order = updates.displayOrder;
    }

    const { error: updateError } = await supabaseAdmin
      .from("item_images")
      .update(updateData)
      .eq("id", imageId);

    if (updateError) {
      console.error("Update error:", updateError);
      return {
        success: false,
        error: "Failed to update image",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating image:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update image",
    };
  }
}

/**
 * Get all images for an item
 */
export async function getItemImages(
  itemId: string,
): Promise<{
  success: boolean;
  error?: string;
  data?: Array<{
    id: string;
    imageUrl: string;
    altText: string | null;
    displayOrder: number;
    isPrimary: boolean;
  }>;
}> {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

    const { data: images, error } = await supabase
      .from("item_images")
      .select("id, image_url, alt_text, display_order, is_primary")
      .eq("item_id", itemId)
      .order("display_order");

    if (error) {
      throw error;
    }

    const formattedImages = images?.map((img) => ({
      id: img.id,
      imageUrl: img.image_url,
      altText: img.alt_text,
      displayOrder: img.display_order || 0,
      isPrimary: img.is_primary || false,
    })) || [];

    return { success: true, data: formattedImages };
  } catch (error) {
    console.error("Error getting item images:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get images",
    };
  }
}

/**
 * Reorder item images
 */
export async function reorderItemImages(
  itemId: string,
  imageOrder: Array<{ id: string; displayOrder: number }>,
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const supabaseAdmin = await createServiceRoleClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Check permissions
    const { data: item } = await supabase
      .from("items")
      .select("project_id")
      .eq("id", itemId)
      .single();

    if (!item) {
      return { success: false, error: "Item not found or access denied" };
    }

    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("project_id", item.project_id)
      .eq("is_active", true)
      .single();

    if (!userRole) {
      return { success: false, error: "No access to this project" };
    }

    // Update display orders
    for (const imageUpdate of imageOrder) {
      await supabaseAdmin
        .from("item_images")
        .update({ display_order: imageUpdate.displayOrder })
        .eq("id", imageUpdate.id)
        .eq("item_id", itemId); // Additional security check
    }

    return { success: true };
  } catch (error) {
    console.error("Error reordering images:", error);
    return {
      success: false,
      error: error instanceof Error
        ? error.message
        : "Failed to reorder images",
    };
  }
}

/**
 * Delete all images for an item (used when deleting an item)
 */
export async function deleteAllItemImages(
  itemId: string,
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const supabaseAdmin = await createServiceRoleClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Get all images for the item
    const { data: images } = await supabase
      .from("item_images")
      .select("id, image_url")
      .eq("item_id", itemId);

    if (!images || images.length === 0) {
      return { success: true }; // No images to delete
    }

    // Delete from storage
    const filePaths = images.map((image) => {
      const url = new URL(image.image_url);
      const pathSegments = url.pathname.split("/");
      return pathSegments.slice(-4).join("/"); // Extract 'private/project_id/item_id/filename'
    });

    const { error: storageError } = await supabaseAdmin.storage
      .from("item-images")
      .remove(filePaths);

    if (storageError) {
      console.warn(
        "Storage deletion error (continuing with DB deletion):",
        storageError,
      );
    }

    // Delete from database
    const { error: dbError } = await supabaseAdmin
      .from("item_images")
      .delete()
      .eq("item_id", itemId);

    if (dbError) {
      console.error("Database deletion error:", dbError);
      return {
        success: false,
        error: "Failed to delete image records",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting all item images:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete images",
    };
  }
}
