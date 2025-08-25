"use server";

import { revalidatePath } from "next/cache";
import {
  createCategorySchema,
  CreateItemPriceData,
  createItemSchema,
  updateItemSchema,
  ItemFilters,
} from "@/lib/validations/items";
import {
  adjustStock,
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
    // Handle both field names for projectId (different forms use different naming)
    const projectId = (formData.get("projectId") || formData.get("project_id")) as string;
    if (!projectId) {
      return { success: false, error: "Project ID is required" };
    }

    // Parse numeric fields carefully since FormData always returns strings
    // Handle both field naming conventions (initialStockQuantity vs stockQuantity)
    const initialStockQuantityStr = formData.get("initialStockQuantity") || formData.get("stockQuantity");
    const initialMinStockLevelStr = formData.get("initialMinStockLevel") || formData.get("minStockLevel");
    const basePriceStr = formData.get("basePrice");
    const sellingPriceStr = formData.get("sellingPrice");
    const discountPercentageStr = formData.get("discountPercentage");
    const weightStr = formData.get("weight");

    const itemData = createItemSchema.parse({
      name: formData.get("name"),
      description: formData.get("description") || null,
      sku: formData.get("sku") || null,
      categoryId: formData.get("categoryId") === "no-category"
        ? null
        : formData.get("categoryId") || null,
      initialStockQuantity: initialStockQuantityStr ? parseInt(initialStockQuantityStr as string, 10) : 0,
      initialMinStockLevel: initialMinStockLevelStr ? parseInt(initialMinStockLevelStr as string, 10) : 0,
      weight: weightStr ? parseFloat(weightStr as string) : null,
      tags: formData.get("tags")
        ? (formData.get("tags") as string).split(",").map((tag) => tag.trim())
          .filter(Boolean)
        : [],
      isFeatured: formData.get("isFeatured") === "true",
      isActive: formData.get("isActive") === "true",
      basePrice: basePriceStr ? parseFloat(basePriceStr as string) : 0,
      sellingPrice: sellingPriceStr ? parseFloat(sellingPriceStr as string) : 0,
      discountPercentage: discountPercentageStr ? parseFloat(discountPercentageStr as string) : 0,
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
    const projectId = (formData.get("projectId") || formData.get("project_id")) as string;

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
export async function getItemsAction(projectId: string, filters?: ItemFilters) {
  try {
    const result = await getItems(projectId, filters);
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

// Adjust item stock action
export async function adjustStockAction(formData: FormData) {
  try {
    const itemId = formData.get("itemId") as string;
    const projectId = formData.get("projectId") as string;
    const adjustment = parseInt(formData.get("adjustment") as string, 10);
    const reason = formData.get("reason") as string;
    const notes = formData.get("notes") as string;

    if (!itemId || !projectId) {
      return { success: false, error: "Item ID and Project ID are required" };
    }

    if (!reason) {
      return { success: false, error: "Reason is required" };
    }

    if (adjustment === 0) {
      return { success: false, error: "Adjustment amount must be non-zero" };
    }

    // Use the existing adjustStock function from data layer
    const result = await adjustStock({
      itemId,
      adjustment,
      reason,
      notes: notes || undefined,
    });

    if (result.success) {
      revalidatePath(`/dashboard/${projectId}/items`);
      revalidatePath(`/dashboard/${projectId}/items/${itemId}/edit`);
      return { success: true };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error("Error adjusting stock:", error);
    return { success: false, error: "Failed to adjust stock" };
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
