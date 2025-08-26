/**
 * Utility functions for item management
 */

/**
 * Generates a unique SKU for an item based on name and timestamp
 */
export function generateSKU(itemName: string): string {
  // Clean the item name: remove special characters, convert to uppercase
  const cleanName = itemName
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '')
    .toUpperCase();

  // Take first 3-4 characters of the clean name
  const namePrefix = cleanName.slice(0, Math.min(4, cleanName.length));

  // Generate timestamp-based suffix (last 6 digits of timestamp)
  const timestamp = Date.now().toString();
  const timestampSuffix = timestamp.slice(-6);

  // Add random 2-digit number for extra uniqueness
  const randomSuffix = Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, '0');

  return `${namePrefix}${timestampSuffix}${randomSuffix}`;
}

/**
 * Calculates selling price based on base price and discount percentage
 */
export function calculateSellingPrice(basePrice: number, discountPercentage: number = 0): number {
  if (discountPercentage <= 0) return basePrice;
  const discount = (basePrice * discountPercentage) / 100;
  return Math.max(0, basePrice - discount);
}

/**
 * Validates if stock quantity is at or below minimum stock level
 */
export function isLowStock(stockQuantity: number, minStockLevel: number = 0): boolean {
  return stockQuantity <= minStockLevel;
}

/**
 * Formats price for display
 */
export function formatPrice(price: number, currency: string = '$'): string {
  return `${currency}${price.toFixed(2)}`;
}

/**
 * Calculates discount amount
 */
export function calculateDiscountAmount(basePrice: number, discountPercentage: number): number {
  return (basePrice * discountPercentage) / 100;
}

/**
 * Validates item form data
 */
export function validateItemData(data: {
  name: string;
  basePrice: number;
  sellingPrice: number;
  discountPercentage: number;
  stockQuantity: number;
}) {
  const errors: string[] = [];

  if (!data.name.trim()) {
    errors.push('Item name is required');
  }

  if (data.basePrice < 0) {
    errors.push('Base price cannot be negative');
  }

  if (data.sellingPrice < 0) {
    errors.push('Selling price cannot be negative');
  }

  if (data.discountPercentage < 0 || data.discountPercentage > 100) {
    errors.push('Discount percentage must be between 0 and 100');
  }

  if (data.stockQuantity < 0) {
    errors.push('Stock quantity cannot be negative');
  }

  // Check if selling price matches calculated discount
  const calculatedSellingPrice = calculateSellingPrice(data.basePrice, data.discountPercentage);
  const priceDifference = Math.abs(data.sellingPrice - calculatedSellingPrice);

  if (priceDifference > 0.01) {
    errors.push('Selling price does not match base price with applied discount');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
