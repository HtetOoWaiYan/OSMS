import { z } from "zod";

// Item validation schemas
export const createItemSchema = z.object({
  name: z.string()
    .min(1, "Item name is required")
    .max(255, "Item name must be less than 255 characters")
    .trim(),
  description: z.string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .nullable(),
  sku: z.string()
    .max(100, "SKU must be less than 100 characters")
    .optional()
    .nullable(),
  categoryId: z.string()
    .uuid("Invalid category ID")
    .optional()
    .nullable(),
  stockQuantity: z.number()
    .int("Stock quantity must be an integer")
    .min(0, "Stock quantity cannot be negative")
    .default(0),
  minStockLevel: z.number()
    .int("Minimum stock level must be an integer")
    .min(0, "Minimum stock level cannot be negative")
    .default(0),
  weight: z.number()
    .min(0, "Weight cannot be negative")
    .optional()
    .nullable(),
  dimensions: z.object({
    length: z.number().min(0, "Length cannot be negative").optional(),
    width: z.number().min(0, "Width cannot be negative").optional(),
    height: z.number().min(0, "Height cannot be negative").optional(),
  }).optional().nullable(),
  tags: z.array(z.string())
    .max(10, "Maximum 10 tags allowed")
    .default([]),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  // Include pricing fields directly in the main schema for convenience
  basePrice: z.number()
    .min(0, "Base price cannot be negative")
    .multipleOf(0.01, "Price must have at most 2 decimal places")
    .default(0),
  sellingPrice: z.number()
    .min(0, "Selling price cannot be negative")
    .multipleOf(0.01, "Price must have at most 2 decimal places")
    .default(0),
  discountPercentage: z.number()
    .min(0, "Discount percentage cannot be negative")
    .max(100, "Discount percentage cannot exceed 100%")
    .multipleOf(0.01, "Discount must have at most 2 decimal places")
    .default(0),
});

export const updateItemSchema = createItemSchema.partial().extend({
  id: z.string().uuid("Invalid item ID"),
});

// Item price validation schemas
export const createItemPriceSchema = z.object({
  itemId: z.string().uuid("Invalid item ID"),
  basePrice: z.number()
    .min(0, "Base price cannot be negative")
    .multipleOf(0.01, "Price must have at most 2 decimal places"),
  sellingPrice: z.number()
    .min(0, "Selling price cannot be negative")
    .multipleOf(0.01, "Price must have at most 2 decimal places"),
  discountPercentage: z.number()
    .min(0, "Discount percentage cannot be negative")
    .max(100, "Discount percentage cannot exceed 100%")
    .multipleOf(0.01, "Discount must have at most 2 decimal places")
    .default(0),
  effectiveFrom: z.date().optional(),
  effectiveUntil: z.date().optional().nullable(),
}).refine(
  (data) =>
    !data.effectiveUntil || data.effectiveFrom ||
    new Date() <= data.effectiveUntil,
  {
    message: "Effective until date must be after effective from date",
    path: ["effectiveUntil"],
  },
);

export const updateItemPriceSchema = createItemPriceSchema.partial().extend({
  id: z.string().uuid("Invalid price ID"),
});

// Category validation schemas
export const createCategorySchema = z.object({
  name: z.string()
    .min(1, "Category name is required")
    .max(255, "Category name must be less than 255 characters")
    .trim(),
  description: z.string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .nullable(),
  isActive: z.boolean().default(true),
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  id: z.string().uuid("Invalid category ID"),
});

// Image upload validation schema
export const imageUploadSchema = z.object({
  file: z.instanceof(File, { message: "File is required" })
    .refine(
      (file) => file.size <= 1024 * 1024,
      "File size must be less than 1MB",
    )
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Only JPEG, PNG, and WebP images are allowed",
    ),
  itemId: z.string().uuid("Invalid item ID"),
  altText: z.string()
    .max(255, "Alt text must be less than 255 characters")
    .optional(),
  isPrimary: z.boolean().default(false),
});

// Search and filter schemas
export const itemFiltersSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  minStock: z.number().int().min(0).optional(),
  maxStock: z.number().int().min(0).optional(),
  sortBy: z.enum(["name", "created_at", "stock_quantity", "price"])
    .default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// Bulk operations schemas
export const bulkUpdateItemsSchema = z.object({
  itemIds: z.array(z.string().uuid())
    .min(1, "At least one item must be selected"),
  action: z.enum(["activate", "deactivate", "feature", "unfeature", "delete"]),
  categoryId: z.string().uuid().optional().nullable(),
});

// Stock adjustment schema
export const stockAdjustmentSchema = z.object({
  itemId: z.string().uuid("Invalid item ID"),
  adjustment: z.number()
    .int("Adjustment must be an integer")
    .refine((val) => val !== 0, "Adjustment cannot be zero"),
  reason: z.string()
    .min(1, "Reason is required")
    .max(255, "Reason must be less than 255 characters"),
  notes: z.string()
    .max(500, "Notes must be less than 500 characters")
    .optional()
    .nullable(),
});

// SKU generation schema
export const skuGenerationSchema = z.object({
  projectId: z.string().uuid("Invalid project ID"),
  prefix: z.string()
    .max(10, "Prefix must be less than 10 characters")
    .optional(),
});

// Type exports for use in components and server actions
export type CreateItemData = z.infer<typeof createItemSchema>;
export type UpdateItemData = z.infer<typeof updateItemSchema>;
export type CreateItemPriceData = z.infer<typeof createItemPriceSchema>;
export type UpdateItemPriceData = z.infer<typeof updateItemPriceSchema>;
export type CreateCategoryData = z.infer<typeof createCategorySchema>;
export type UpdateCategoryData = z.infer<typeof updateCategorySchema>;
export type ImageUploadData = z.infer<typeof imageUploadSchema>;
export type ItemFilters = z.infer<typeof itemFiltersSchema>;
export type BulkUpdateItemsData = z.infer<typeof bulkUpdateItemsSchema>;
export type StockAdjustmentData = z.infer<typeof stockAdjustmentSchema>;
export type SkuGenerationData = z.infer<typeof skuGenerationSchema>;
