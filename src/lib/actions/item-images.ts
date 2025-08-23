"use server";

import { createClient } from "@/lib/supabase/server";
import {
  createItemImage,
  deleteItemImage,
  getItemImages,
} from "@/lib/data/items";
import { revalidatePath } from "next/cache";
import type { Tables } from "@/lib/supabase/database.types";

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

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return { success: false, error: "File must be an image" };
    }

    // Validate file size (max 1MB)
    const maxSize = 1 * 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      const fileSizeInMB = (file.size / 1024 / 1024).toFixed(2);
      return {
        success: false,
        error:
          `Image "${file.name}" is too large (${fileSizeInMB}MB). Maximum size allowed is 1MB.`,
      };
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${itemId}/${Date.now()}-${
      Math.random().toString(36).substr(2, 9)
    }.${fileExt}`;
    const filePath = `${projectId}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("item-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      if (uploadError.message?.includes("row-level security policy")) {
        return {
          success: false,
          error: "You don't have permission to upload images to this project.",
        };
      } else if (uploadError.message?.includes("size")) {
        return {
          success: false,
          error: "Image file is too large. Please choose a smaller image.",
        };
      } else {
        return {
          success: false,
          error: `Failed to upload image: ${uploadError.message}`,
        };
      }
    }

    // Get public URL (bucket is public for product catalog)
    const { data: { publicUrl } } = supabase.storage
      .from("item-images")
      .getPublicUrl(filePath);

    // If this is set as primary, make sure no other images are primary
    if (isPrimary) {
      const existingImages = await getItemImages(itemId);
      if (existingImages.success && existingImages.data) {
        // Update existing primary image to not be primary
        const currentPrimary = existingImages.data.find((
          img: Tables<"item_images">,
        ) => img.is_primary);
        if (currentPrimary) {
          await supabase
            .from("item_images")
            .update({ is_primary: false })
            .eq("id", currentPrimary.id);
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
      // Clean up uploaded file if database insert failed
      await supabase.storage.from("item-images").remove([filePath]);
      return { success: false, error: "Failed to save image record" };
    }
  } catch (error) {
    console.error("Upload image error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Delete an item image
export async function deleteItemImageAction(
  imageId: string,
  projectId: string,
): Promise<DeleteImageResult> {
  try {
    const supabase = await createClient();

    // Get image record first to get the storage path
    const { data: image } = await supabase
      .from("item_images")
      .select("image_url")
      .eq("id", imageId)
      .single();

    if (!image) {
      return { success: false, error: "Image not found" };
    }

    // Extract storage path from URL
    const url = new URL(image.image_url);
    const pathParts = url.pathname.split("/");
    const storagePath = pathParts.slice(-2).join("/"); // Get last two parts: projectId/filename

    // Delete from database first
    const deleteResult = await deleteItemImage(imageId);
    if (!deleteResult.success) {
      return { success: false, error: "Failed to delete image record" };
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("item-images")
      .remove([`${projectId}/${storagePath.split("/")[1]}`]);

    if (storageError) {
      console.error("Storage deletion error:", storageError);
      // Don't fail if storage deletion fails - the database record is already gone
    }

    revalidatePath(`/dashboard/${projectId}/items`);
    return { success: true };
  } catch (error) {
    console.error("Delete image error:", error);
    return { success: false, error: "An unexpected error occurred" };
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

      const result = await uploadItemImageAction(
        itemId,
        projectId,
        file,
        undefined,
        isPrimary,
      );
      results.push(result);

      // Stop if we encounter an error (optional - could continue uploading others)
      if (!result.success) {
        console.error(`Failed to upload file ${file.name}:`, result.error);
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const hasErrors = results.some((r) => !r.success);

    return {
      success: successCount > 0,
      results,
      error: hasErrors
        ? `${results.length - successCount} uploads failed`
        : undefined,
    };
  } catch (error) {
    console.error("Bulk upload error:", error);
    return {
      success: false,
      results: [],
      error: "An unexpected error occurred during bulk upload",
    };
  }
}

// Get all images for an item (server action wrapper)
export async function getItemImagesAction(itemId: string) {
  return await getItemImages(itemId);
}
