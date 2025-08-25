import "server-only";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert } from "@/lib/supabase/database.types";
import type {
  BulkUpdateItemsData,
  CreateCategoryData,
  CreateItemData,
  CreateItemPriceData,
  ItemFilters,
  StockAdjustmentData,
  UpdateCategoryData,
  UpdateItemData,
} from "@/lib/validations/items";

// Type aliases for better readability
type Item = Tables<"items">;
type ItemWithPrice = Tables<"items"> & {
  current_price?: Partial<Tables<"item_prices">> | null;
  category?: Tables<"categories"> | null;
  item_images?: Array<{
    image_url: string;
    display_order: number | null;
    is_primary: boolean | null;
  }>;
  first_image_url?: string;
  image_count?: number;
};
type Category = Tables<"categories">;
type ItemPrice = Tables<"item_prices">;

type ItemInsert = TablesInsert<"items">;
type CategoryInsert = TablesInsert<"categories">;
type ItemPriceInsert = TablesInsert<"item_prices">;
type StockMovementInsert = TablesInsert<"stock_movements">;

/**
 * Data access layer for item management
 * Follows the Data Access Layer pattern as recommended by Next.js security best practices
 */

// ============================================================================
// ITEM CRUD OPERATIONS
// ============================================================================

/**
 * Get all items for a project with optional filtering and pagination
 */
export async function getItems(
  projectId: string,
  filters?: ItemFilters,
): Promise<{
  success: boolean;
  error?: string;
  data?: {
    items: ItemWithPrice[];
    total: number;
    page: number;
    limit: number;
  };
}> {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Build query with filters
    let query = supabase
      .from("items")
      .select(`
        *,
        category:categories(*),
        item_prices!left(
          id,
          base_price,
          selling_price,
          discount_percentage,
          is_active,
          effective_from,
          effective_until
        ),
        item_images!left(
          image_url,
          display_order,
          is_primary
        )
      `)
      .eq("project_id", projectId);

    // Apply filters
    if (filters?.search) {
      query = query.ilike("name", `%${filters.search}%`);
    }
    if (filters?.categoryId !== undefined) {
      if (filters.categoryId === null) {
        query = query.is("category_id", null);
      } else {
        query = query.eq("category_id", filters.categoryId);
      }
    }
    if (filters?.isActive !== undefined) {
      query = query.eq("is_active", filters.isActive);
    }
    if (filters?.isFeatured !== undefined) {
      query = query.eq("is_featured", filters.isFeatured);
    }
    if (filters?.minStock !== undefined) {
      query = query.gte("stock_quantity", filters.minStock);
    }
    if (filters?.maxStock !== undefined) {
      query = query.lte("stock_quantity", filters.maxStock);
    }

    // Apply sorting
    const sortBy = filters?.sortBy || "created_at";
    const sortOrder = filters?.sortOrder || "desc";
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    // Apply pagination - build separate count query
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;

    // Get total count
    let countQuery = supabase
      .from("items")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId);

    // Apply same filters to count query
    if (filters?.search) {
      countQuery = countQuery.ilike("name", `%${filters.search}%`);
    }
    if (filters?.categoryId !== undefined) {
      if (filters.categoryId === null) {
        countQuery = countQuery.is("category_id", null);
      } else {
        countQuery = countQuery.eq("category_id", filters.categoryId);
      }
    }
    if (filters?.isActive !== undefined) {
      countQuery = countQuery.eq("is_active", filters.isActive);
    }
    if (filters?.isFeatured !== undefined) {
      countQuery = countQuery.eq("is_featured", filters.isFeatured);
    }
    if (filters?.minStock !== undefined) {
      countQuery = countQuery.gte("stock_quantity", filters.minStock);
    }
    if (filters?.maxStock !== undefined) {
      countQuery = countQuery.lte("stock_quantity", filters.maxStock);
    }

    query = query.range(offset, offset + limit - 1);

    const [{ data: items, error }, { count }] = await Promise.all([
      query,
      countQuery,
    ]);

    if (error) {
      throw error;
    }

    // Transform data to include current price and first image
    const itemsWithPrices = items?.map((item) => {
      // Handle items that might not have prices or active prices
      const activePrices = item.item_prices?.filter((p) => p && p.is_active) || [];
      const currentPrice = activePrices.length > 0
        ? activePrices.sort((a, b) =>
            new Date(b.effective_from!).getTime() -
            new Date(a.effective_from!).getTime()
          )[0]
        : null; // No active price found

      // Get first image URL - prefer primary image, then by display order
      let firstImageUrl: string | undefined = undefined;
      if (item.item_images && item.item_images.length > 0) {
        // First try to find a primary image
        const primaryImage = item.item_images.find((img) =>
          img.is_primary
        );
        if (primaryImage) {
          firstImageUrl = primaryImage.image_url;
        } else {
          // Otherwise, use the first image sorted by display order
          const sortedImages = [...item.item_images].sort((a, b) =>
            (a.display_order || 0) - (b.display_order || 0)
          );
          firstImageUrl = sortedImages[0]?.image_url;
        }
      }

      return {
        ...item,
        current_price: currentPrice,
        first_image_url: firstImageUrl,
        image_count: item.item_images?.length || 0,
      };
    }) || [];

    return {
      success: true,
      data: {
        items: itemsWithPrices,
        total: count || 0,
        page,
        limit,
      },
    };
  } catch (error) {
    console.error("Error getting items:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get items",
    };
  }
}

/**
 * Get a single item by ID with all related data
 */
export async function getItem(itemId: string): Promise<{
  success: boolean;
  error?: string;
  data?: ItemWithPrice;
}> {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

    const { data: item, error } = await supabase
      .from("items")
      .select(`
        *,
        category:categories(*),
        item_prices(
          id,
          base_price,
          selling_price,
          discount_percentage,
          is_active,
          effective_from,
          effective_until
        ),
        item_images(*)
      `)
      .eq("id", itemId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return { success: false, error: "Item not found or access denied" };
      }
      throw error;
    }

    // Get current active price
    const activePrices = item.item_prices?.filter((p) => p.is_active) || [];
    const currentPrice = activePrices.sort((a, b) =>
      new Date(b.effective_from!).getTime() -
      new Date(a.effective_from!).getTime()
    )[0];

    const itemWithPrice = {
      ...item,
      current_price: currentPrice,
      images: item.item_images || [],
    };

    return { success: true, data: itemWithPrice };
  } catch (error) {
    console.error("Error getting item:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get item",
    };
  }
}

/**
 * Generate next SKU for a project
 */
export async function generateNextSku(
  projectId: string,
  prefix?: string,
): Promise<{
  success: boolean;
  error?: string;
  data?: string;
}> {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Get project details for SKU prefix
    const { data: project } = await supabase
      .from("projects")
      .select("name")
      .eq("id", projectId)
      .single();

    const skuPrefix = prefix || project?.name?.substring(0, 4).toUpperCase() ||
      "PROJ";

    // Get the latest item number for this project
    const { data: latestItem } = await supabase
      .from("items")
      .select("sku")
      .eq("project_id", projectId)
      .not("sku", "is", null)
      .ilike("sku", `${skuPrefix}-%`)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    let nextNumber = 1;
    if (latestItem?.sku) {
      const match = latestItem.sku.match(/-(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    const nextSku = `${skuPrefix}-${nextNumber.toString().padStart(3, "0")}`;

    return { success: true, data: nextSku };
  } catch (error) {
    console.error("Error generating SKU:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate SKU",
    };
  }
}

/**
 * Create a new item with price
 */
export async function createItem(
  projectId: string,
  itemData: CreateItemData,
  priceData: CreateItemPriceData,
): Promise<{
  success: boolean;
  error?: string;
  data?: Item;
}> {
  try {
    const supabase = await createClient();
    const supabaseAdmin = await createServiceRoleClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Check user permissions
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role, project_id")
      .eq("user_id", user.id)
      .eq("project_id", projectId)
      .eq("is_active", true)
      .single();

    if (!userRole) {
      return { success: false, error: "No access to this project" };
    }

    // Generate SKU if not provided
    let sku = itemData.sku;
    if (!sku) {
      const skuResult = await generateNextSku(projectId);
      if (!skuResult.success) {
        return { success: false, error: skuResult.error };
      }
      sku = skuResult.data;
    }

    // Create item using service role client
    const itemInsert: ItemInsert = {
      project_id: projectId,
      category_id: itemData.categoryId,
      name: itemData.name,
      description: itemData.description,
      sku,
      stock_quantity: itemData.stockQuantity,
      min_stock_level: itemData.minStockLevel,
      weight: itemData.weight,
      dimensions: itemData.dimensions
        ? JSON.parse(JSON.stringify(itemData.dimensions))
        : null,
      is_active: itemData.isActive,
      is_featured: itemData.isFeatured,
      tags: itemData.tags,
    };

    const { data: item, error: itemError } = await supabaseAdmin
      .from("items")
      .insert(itemInsert)
      .select()
      .single();

    if (itemError) {
      throw itemError;
    }

    // Create initial price
    const priceInsert: ItemPriceInsert = {
      item_id: item.id,
      base_price: priceData.basePrice,
      selling_price: priceData.sellingPrice,
      discount_percentage: priceData.discountPercentage,
      is_active: true,
      effective_from: priceData.effectiveFrom?.toISOString() ||
        new Date().toISOString(),
    };

    const { error: priceError } = await supabaseAdmin
      .from("item_prices")
      .insert(priceInsert);

    if (priceError) {
      // Rollback item creation if price creation fails
      await supabaseAdmin
        .from("items")
        .delete()
        .eq("id", item.id);
      throw priceError;
    }

    return { success: true, data: item };
  } catch (error) {
    console.error("Error creating item:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create item",
    };
  }
}

/**
 * Update an existing item
 */
export async function updateItem(
  itemId: string,
  itemData: Partial<UpdateItemData>,
): Promise<{
  success: boolean;
  error?: string;
  data?: Item;
}> {
  try {
    const supabase = await createClient();
    const supabaseAdmin = await createServiceRoleClient();

    // Check authentication and get current item for permission check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Get current item to check project access
    const { data: currentItem } = await supabase
      .from("items")
      .select("project_id")
      .eq("id", itemId)
      .single();

    if (!currentItem) {
      return { success: false, error: "Item not found or access denied" };
    }

    // Check user permissions
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("project_id", currentItem.project_id)
      .eq("is_active", true)
      .single();

    if (!userRole) {
      return { success: false, error: "No access to this project" };
    }

    // Update item using service role client
    // Map camelCase fields to snake_case for database
    const updateData: Partial<ItemInsert> = {};

    if (itemData.name !== undefined) updateData.name = itemData.name;
    if (itemData.description !== undefined) {
      updateData.description = itemData.description;
    }
    if (itemData.sku !== undefined) updateData.sku = itemData.sku;
    if (itemData.categoryId !== undefined) {
      updateData.category_id = itemData.categoryId;
    }
    if (itemData.stockQuantity !== undefined) {
      updateData.stock_quantity = itemData.stockQuantity;
    }
    if (itemData.minStockLevel !== undefined) {
      updateData.min_stock_level = itemData.minStockLevel;
    }
    if (itemData.weight !== undefined) updateData.weight = itemData.weight;
    if (itemData.dimensions !== undefined) {
      updateData.dimensions = itemData.dimensions
        ? JSON.parse(JSON.stringify(itemData.dimensions))
        : null;
    }
    if (itemData.isActive !== undefined) {
      updateData.is_active = itemData.isActive;
    }
    if (itemData.isFeatured !== undefined) {
      updateData.is_featured = itemData.isFeatured;
    }
    if (itemData.tags !== undefined) updateData.tags = itemData.tags;

    // Always update the timestamp
    updateData.updated_at = new Date().toISOString();

    const { data: item, error } = await supabaseAdmin
      .from("items")
      .update(updateData)
      .eq("id", itemId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { success: true, data: item };
  } catch (error) {
    console.error("Error updating item:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update item",
    };
  }
}

/**
 * Soft delete an item (set is_active to false)
 */
export async function deleteItem(itemId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const supabaseAdmin = await createServiceRoleClient();

    // Check authentication and get current item for permission check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Get current item to check project access
    const { data: currentItem } = await supabase
      .from("items")
      .select("project_id")
      .eq("id", itemId)
      .single();

    if (!currentItem) {
      return { success: false, error: "Item not found or access denied" };
    }

    // Check user permissions
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("project_id", currentItem.project_id)
      .eq("is_active", true)
      .single();

    if (!userRole) {
      return { success: false, error: "No access to this project" };
    }

    // Soft delete by setting is_active to false
    const { error } = await supabaseAdmin
      .from("items")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", itemId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting item:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete item" };
  }
}

/**
 * Bulk update items
 */
export async function bulkUpdateItems(
  projectId: string,
  data: BulkUpdateItemsData,
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

    // Check user permissions
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

    // Prepare update data based on action
    let updateData: Partial<ItemInsert> = {};

    switch (data.action) {
      case "activate":
        updateData = { is_active: true };
        break;
      case "deactivate":
        updateData = { is_active: false };
        break;
      case "feature":
        updateData = { is_featured: true };
        break;
      case "unfeature":
        updateData = { is_featured: false };
        break;
      case "delete":
        updateData = { is_active: false };
        break;
      default:
        return { success: false, error: "Invalid action" };
    }

    // Add category update if provided
    if (data.categoryId !== undefined) {
      updateData.category_id = data.categoryId;
    }

    // Perform bulk update
    const { error } = await supabaseAdmin
      .from("items")
      .update(updateData)
      .in("id", data.itemIds)
      .eq("project_id", projectId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error bulk updating items:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update items",
    };
  }
}

// ============================================================================
// STOCK MANAGEMENT
// ============================================================================

/**
 * Adjust item stock quantity
 */
export async function adjustStock(
  data: StockAdjustmentData,
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

    // Get current item and check permissions
    const { data: item } = await supabase
      .from("items")
      .select("project_id, stock_quantity, name")
      .eq("id", data.itemId)
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

    const newQuantity = item.stock_quantity + data.adjustment;

    if (newQuantity < 0) {
      return {
        success: false,
        error: "Insufficient stock for this adjustment",
      };
    }

    // Update stock quantity
    const { error: updateError } = await supabaseAdmin
      .from("items")
      .update({ stock_quantity: newQuantity })
      .eq("id", data.itemId);

    if (updateError) {
      throw updateError;
    }

    // Record stock movement
    const stockMovementInsert: StockMovementInsert = {
      item_id: data.itemId,
      movement_type: data.adjustment > 0 ? "in" : "out",
      quantity: Math.abs(data.adjustment),
      reason: "adjustment",
      notes: data.notes,
      created_by: user.id,
    };

    const { error: movementError } = await supabaseAdmin
      .from("stock_movements")
      .insert(stockMovementInsert);

    if (movementError) {
      // Don't fail the entire operation if stock movement logging fails
      console.error("Failed to log stock movement:", movementError);
    }

    return { success: true };
  } catch (error) {
    console.error("Error adjusting stock:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to adjust stock",
    };
  }
}

// ============================================================================
// CATEGORY CRUD OPERATIONS
// ============================================================================

/**
 * Get all categories for a project
 */
export async function getCategories(projectId: string): Promise<{
  success: boolean;
  error?: string;
  data?: Category[];
}> {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

    const { data: categories, error } = await supabase
      .from("categories")
      .select("*")
      .eq("project_id", projectId)
      .order("name");

    if (error) {
      throw error;
    }

    return { success: true, data: categories || [] };
  } catch (error) {
    console.error("Error getting categories:", error);
    return {
      success: false,
      error: error instanceof Error
        ? error.message
        : "Failed to get categories",
    };
  }
}

/**
 * Create a new category
 */
export async function createCategory(
  projectId: string,
  data: CreateCategoryData,
): Promise<{
  success: boolean;
  error?: string;
  data?: Category;
}> {
  try {
    const supabase = await createClient();
    const supabaseAdmin = await createServiceRoleClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Check user permissions
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role, project_id")
      .eq("user_id", user.id)
      .eq("project_id", projectId)
      .eq("is_active", true)
      .single();

    if (!userRole) {
      return { success: false, error: "No access to this project" };
    }

    // Create category using service role client
    const categoryInsert: CategoryInsert = {
      project_id: projectId,
      name: data.name,
      description: data.description,
      is_active: data.isActive,
    };

    const { data: category, error } = await supabaseAdmin
      .from("categories")
      .insert(categoryInsert)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") { // Unique constraint violation
        return {
          success: false,
          error: "A category with this name already exists",
        };
      }
      throw error;
    }

    return { success: true, data: category };
  } catch (error) {
    console.error("Error creating category:", error);
    return {
      success: false,
      error: error instanceof Error
        ? error.message
        : "Failed to create category",
    };
  }
}

/**
 * Update an existing category
 */
export async function updateCategory(
  categoryId: string,
  data: Partial<UpdateCategoryData>,
): Promise<{
  success: boolean;
  error?: string;
  data?: Category;
}> {
  try {
    const supabase = await createClient();
    const supabaseAdmin = await createServiceRoleClient();

    // Check authentication and get current category for permission check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Get current category to check project access
    const { data: currentCategory } = await supabase
      .from("categories")
      .select("project_id")
      .eq("id", categoryId)
      .single();

    if (!currentCategory) {
      return { success: false, error: "Category not found or access denied" };
    }

    // Check user permissions
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("project_id", currentCategory.project_id)
      .eq("is_active", true)
      .single();

    if (!userRole) {
      return { success: false, error: "No access to this project" };
    }

    // Update category using service role client
    const { data: category, error } = await supabaseAdmin
      .from("categories")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", categoryId)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") { // Unique constraint violation
        return {
          success: false,
          error: "A category with this name already exists",
        };
      }
      throw error;
    }

    return { success: true, data: category };
  } catch (error) {
    console.error("Error updating category:", error);
    return {
      success: false,
      error: error instanceof Error
        ? error.message
        : "Failed to update category",
    };
  }
}

/**
 * Delete a category (set is_active to false)
 */
export async function deleteCategory(categoryId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  return updateCategory(categoryId, { isActive: false });
}

// ============================================================================
// PRICE MANAGEMENT
// ============================================================================

/**
 * Create a new price for an item
 */
export async function createItemPrice(
  data: CreateItemPriceData,
): Promise<{
  success: boolean;
  error?: string;
  data?: ItemPrice;
}> {
  try {
    const supabase = await createClient();
    const supabaseAdmin = await createServiceRoleClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Check access to item
    const { data: item } = await supabase
      .from("items")
      .select("project_id")
      .eq("id", data.itemId)
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

    // Deactivate current active price by setting effective_until to now
    const now = new Date();
    const { error: deactivateError } = await supabaseAdmin
      .from("item_prices")
      .update({
        is_active: false,
        effective_until: now.toISOString(),
      })
      .eq("item_id", data.itemId)
      .eq("is_active", true)
      .is("effective_until", null);

    if (deactivateError) {
      console.error("Failed to deactivate previous prices:", deactivateError);
      return {
        success: false,
        error: "Failed to deactivate previous prices: " +
          deactivateError.message,
      };
    }

    // Create new price
    const priceInsert: ItemPriceInsert = {
      item_id: data.itemId,
      base_price: data.basePrice,
      selling_price: data.sellingPrice,
      discount_percentage: data.discountPercentage,
      is_active: true,
      effective_from: data.effectiveFrom?.toISOString() ||
        new Date().toISOString(),
      effective_until: data.effectiveUntil?.toISOString(),
    };

    const { data: price, error } = await supabaseAdmin
      .from("item_prices")
      .insert(priceInsert)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { success: true, data: price };
  } catch (error) {
    console.error("Error creating item price:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create price",
    };
  }
}

// ============================================================================
// ITEM IMAGE MANAGEMENT
// ============================================================================

/**
 * Get all images for a specific item
 */
export async function getItemImages(itemId: string): Promise<{
  success: boolean;
  error?: string;
  data?: Tables<"item_images">[];
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("item_images")
      .select("*")
      .eq("item_id", itemId)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Get item images error:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error("Get item images error:", error);
    return {
      success: false,
      error: error instanceof Error
        ? error.message
        : "Failed to get item images",
    };
  }
}

/**
 * Create a new item image record
 */
export async function createItemImage(imageData: {
  item_id: string;
  image_url: string;
  alt_text?: string | null;
  display_order?: number;
  is_primary?: boolean;
}): Promise<{
  success: boolean;
  error?: string;
  data?: Tables<"item_images">;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("item_images")
      .insert({
        item_id: imageData.item_id,
        image_url: imageData.image_url,
        alt_text: imageData.alt_text,
        display_order: imageData.display_order || 0,
        is_primary: imageData.is_primary || false,
      })
      .select()
      .single();

    if (error) {
      console.error("Create item image error:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Create item image error:", error);
    return {
      success: false,
      error: error instanceof Error
        ? error.message
        : "Failed to create item image",
    };
  }
}

/**
 * Update an item image record
 */
export async function updateItemImage(
  imageId: string,
  updateData: {
    alt_text?: string | null;
    display_order?: number;
    is_primary?: boolean;
  },
): Promise<{
  success: boolean;
  error?: string;
  data?: Tables<"item_images">;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("item_images")
      .update(updateData)
      .eq("id", imageId)
      .select()
      .single();

    if (error) {
      console.error("Update item image error:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Update item image error:", error);
    return {
      success: false,
      error: error instanceof Error
        ? error.message
        : "Failed to update item image",
    };
  }
}

/**
 * Delete an item image record
 */
export async function deleteItemImage(imageId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("item_images")
      .delete()
      .eq("id", imageId);

    if (error) {
      console.error("Delete item image error:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Delete item image error:", error);
    return {
      success: false,
      error: error instanceof Error
        ? error.message
        : "Failed to delete item image",
    };
  }
}
