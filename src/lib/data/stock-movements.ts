import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Tables } from '@/lib/supabase/database.types';

type StockMovement = Tables<'stock_movements'>;

/**
 * Get stock movements for a specific item with user information
 */
export async function getStockMovements(itemId: string): Promise<{
  success: boolean;
  error?: string;
  data?: StockMovement[];
}> {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Authentication required' };
    }

    // Get stock movements (user information will be handled separately for now)
    const { data: movements, error } = await supabase
      .from('stock_movements')
      .select(
        `
        *
      `,
      )
      .eq('item_id', itemId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Stock movements query error:', error);
      return { success: false, error: 'Failed to get stock movements' };
    }

    return { success: true, data: movements || [] };
  } catch (error) {
    console.error('Error getting stock movements:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get stock movements',
    };
  }
}
