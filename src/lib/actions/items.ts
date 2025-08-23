"use server";

import { revalidatePath } from "next/cache";
import {
  createCategorySchema,
  CreateItemPriceData,
  createItemSchema,
  updateItemSchema,
} from "@/lib/validations/items";
import {
  createCategory,
  createItem,
  createItemPrice,
  deleteItem,
  getCategories,
  getItem,
  getItems,
  updateItem,
} from "@/lib/data/items";

// Simple version for direct calls (client components)
export async function createItemActionSimple(formData: FormData) {
  try {
    const projectId = formData.get("projectId") as string;
    if (!projectId) {
      return { success: false, error: "Project ID is required" };
    }

    const itemData = createItemSchema.parse({
      name: formData.get("name"),
      description: formData.get("description") || null,
      sku: formData.get("sku") || null,
      categoryId: formData.get("categoryId") === "no-category"
        ? null
        : formData.get("categoryId") || null,
      stockQuantity: parseInt(formData.get("stockQuantity") as string) || 0,
      minStockLevel: parseInt(formData.get("minStockLevel") as string) || 0,
      weight: parseFloat(formData.get("weight") as string) || null,
      tags: formData.get("tags")
        ? (formData.get("tags") as string).split(",").map((tag) => tag.trim())
          .filter(Boolean)
        : [],
      isFeatured: formData.get("isFeatured") === "true",
      isActive: formData.get("isActive") === "true",
      basePrice: parseFloat(formData.get("basePrice") as string) || 0,
      sellingPrice: parseFloat(formData.get("sellingPrice") as string) || 0,
      discountPercentage:
        parseFloat(formData.get("discountPercentage") as string) || 0,
    });

    // Separate price data (don't validate itemId since it will be set by createItem)
    const priceData = {
      itemId: "", // Will be set after item creation
      basePrice: itemData.basePrice,
      sellingPrice: itemData.sellingPrice,
      discountPercentage: itemData.discountPercentage,
    } as CreateItemPriceData;

    // Create the item with price
    const result = await createItem(projectId, itemData, priceData);

    if (result.success) {
      revalidatePath(`/dashboard/${projectId}/items`);
      return { success: true, data: result.data };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error: unknown) {
    console.error("Error creating item:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create item" };
  }
}

// Update item action
export async function updateItemActionSimple(formData: FormData) {
  try {
    const itemId = formData.get("itemId") as string;
    const projectId = formData.get("projectId") as string;

    if (!itemId || !projectId) {
      return { success: false, error: "Item ID and Project ID are required" };
    }

    const itemData = updateItemSchema.parse({
      id: itemId,
      name: formData.get("name"),
      description: formData.get("description") || null,
      sku: formData.get("sku") || null,
      categoryId: formData.get("categoryId") === "no-category"
        ? null
        : formData.get("categoryId") || null,
      stockQuantity: parseInt(formData.get("stockQuantity") as string) || 0,
      minStockLevel: parseInt(formData.get("minStockLevel") as string) || 0,
      weight: parseFloat(formData.get("weight") as string) || null,
      tags: formData.get("tags")
        ? (formData.get("tags") as string).split(",").map((tag) => tag.trim())
          .filter(Boolean)
        : [],
      isFeatured: formData.get("isFeatured") === "true",
      isActive: formData.get("isActive") === "true",
      basePrice: parseFloat(formData.get("basePrice") as string) || 0,
      sellingPrice: parseFloat(formData.get("sellingPrice") as string) || 0,
      discountPercentage:
        parseFloat(formData.get("discountPercentage") as string) || 0,
    });

    // Remove the id field since it's passed separately to updateItem
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, basePrice, sellingPrice, discountPercentage, ...updateData } =
      itemData;

    // Check if prices have changed by comparing with current item data
    const priceFields = { basePrice, sellingPrice, discountPercentage };
    const hasPriceChanges = Object.values(priceFields).some((val) =>
      val !== undefined
    );

    // Update the item (excluding price fields which are handled separately)
    const result = await updateItem(itemId, updateData);

    if (result.success && hasPriceChanges) {
      // If prices have changed, create a new price record
      // This maintains price history which is important for business reporting
      const priceData = {
        itemId,
        basePrice: basePrice || 0,
        sellingPrice: sellingPrice || 0,
        discountPercentage: discountPercentage || 0,
        effectiveFrom: new Date(),
      } as CreateItemPriceData;

      await createItemPrice(priceData);
    }

    if (result.success) {
      revalidatePath(`/dashboard/${projectId}/items`);
      return { success: true, data: result.data };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error: unknown) {
    console.error("Error updating item:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update item" };
  }
}

// Get single item action
export async function getItemAction(itemId: string) {
  try {
    const result = await getItem(itemId);
    return result;
  } catch (error) {
    console.error("Error getting item:", error);
    return { success: false, error: "Failed to get item" };
  }
}

// Get items action
export async function getItemsAction(projectId: string) {
  try {
    const result = await getItems(projectId);
    return result;
  } catch (error) {
    console.error("Error getting items:", error);
    return { success: false, error: "Failed to get items" };
  }
}

// Get categories action
export async function getCategoriesAction(projectId: string) {
  try {
    const result = await getCategories(projectId);
    return result;
  } catch (error) {
    console.error("Error getting categories:", error);
    return { success: false, error: "Failed to get categories" };
  }
}

// Create category action
export async function createCategoryActionSimple(formData: FormData) {
  try {
    const projectId = formData.get("projectId") as string;
    if (!projectId) {
      return { success: false, error: "Project ID is required" };
    }

    const categoryData = createCategorySchema.parse({
      name: formData.get("name"),
      description: formData.get("description") || null,
      isActive: formData.get("isActive") !== "false",
    });

    const result = await createCategory(projectId, categoryData);

    if (result.success) {
      revalidatePath(`/dashboard/${projectId}/items`);
      return { success: true, data: result.data };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error: unknown) {
    console.error("Error creating category:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create category" };
  }
}

// Toggle item active status action
export async function toggleItemStatusAction(formData: FormData) {
  try {
    const itemId = formData.get("itemId") as string;
    const projectId = formData.get("projectId") as string;
    const currentStatus = formData.get("isActive") === "true";

    if (!itemId || !projectId) {
      return { success: false, error: "Item ID and Project ID are required" };
    }

    // Toggle the status
    const result = await updateItem(itemId, { isActive: !currentStatus });

    if (result.success) {
      revalidatePath(`/dashboard/${projectId}/items`);
      return { success: true };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error("Error toggling item status:", error);
    return { success: false, error: "Failed to toggle item status" };
  }
}

// Delete item action
export async function deleteItemAction(formData: FormData) {
  try {
    const itemId = formData.get("itemId") as string;
    const projectId = formData.get("projectId") as string;

    if (!itemId || !projectId) {
      return { success: false, error: "Item ID and Project ID are required" };
    }

    const result = await deleteItem(itemId);

    if (result.success) {
      revalidatePath(`/dashboard/${projectId}/items`);
      return { success: true };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error("Error deleting item:", error);
    return { success: false, error: "Failed to delete item" };
  }
}
