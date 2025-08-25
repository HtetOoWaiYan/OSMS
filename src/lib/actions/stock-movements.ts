"use server";

import { getStockMovements } from "@/lib/data/stock-movements";

/**
 * Get stock movements for a specific item
 */
export async function getStockMovementsAction(itemId: string) {
  try {
    if (!itemId) {
      return { success: false, error: "Item ID is required" };
    }

    const result = await getStockMovements(itemId);
    return result;
  } catch (error) {
    console.error("Error getting stock movements:", error);
    return { success: false, error: "Failed to get stock movements" };
  }
}
