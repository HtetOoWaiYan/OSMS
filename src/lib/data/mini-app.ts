import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { unstable_cache } from "next/cache";
import type { Tables } from "@/lib/supabase/database.types";

// Types
type ItemWithPrices = Tables<"items"> & {
  item_prices?: Partial<Tables<"item_prices">> | null;
  category?: Tables<"categories"> | null;
  item_images?: Array<{
    image_url: string;
    display_order: number | null;
    is_primary: boolean | null;
  }>;
  first_image_url?: string;
  image_count?: number;
  // Computed convenience fields
  current_price?: number;
  original_price?: number;
};

interface ItemFilters {
  search?: string;
  category?: string;
  sort?: 'name' | 'price_asc' | 'price_desc' | 'created';
}

/**
 * Get active items for mini-app with caching (5 minutes)
 */
export const getItemsWithCache = unstable_cache(
  async (projectId: string, filters?: ItemFilters): Promise<ItemWithPrices[]> => {
    const serviceClient = createServiceRoleClient();

    let query = serviceClient
      .from('items')
      .select(`
        *,
        categories(name),
        item_prices!inner(
          base_price,
          selling_price,
          effective_from,
          effective_until
        ),
        item_images(
          image_url,
          display_order,
          is_primary
        )
      `)
      .eq('project_id', projectId)
      .eq('is_active', true)
      .is('item_prices.effective_until', null) // Current prices only
      .gte('stock_quantity', 1); // Only items in stock

    // Apply filters
    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    if (filters?.category) {
      query = query.eq('category_id', filters.category);
    }

    // Apply sorting
    switch (filters?.sort) {
      case 'name':
        query = query.order('name');
        break;
      case 'price_asc':
        query = query.order('item_prices(selling_price)', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('item_prices(selling_price)', { ascending: false });
        break;
      case 'created':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching items:', error);
      return [];
    }

    // Process the data to add computed fields
    return (data || []).map(item => {
      const price = Array.isArray(item.item_prices) ? item.item_prices[0] : item.item_prices;
      return {
        ...item,
        first_image_url: item.item_images?.find(img => img.is_primary)?.image_url || 
                       item.item_images?.[0]?.image_url,
        image_count: item.item_images?.length || 0,
        current_price: price?.selling_price || 0,
        original_price: price?.base_price,
        item_prices: price
      };
    });
  },
  ['mini-app-items'],
  { 
    revalidate: 300, // 5 minutes
    tags: ['items', 'mini-app-items']
  }
);

/**
 * Get single item with cache (5 minutes)
 */
export const getItemDetailWithCache = unstable_cache(
  async (itemId: string): Promise<ItemWithPrices | null> => {
    const serviceClient = createServiceRoleClient();

    const { data, error } = await serviceClient
      .from('items')
      .select(`
        *,
        categories(name),
        item_prices!inner(
          base_price,
          selling_price,
          effective_from,
          effective_until
        ),
        item_images(
          image_url,
          display_order,
          is_primary
        )
      `)
      .eq('id', itemId)
      .eq('is_active', true)
      .is('item_prices.effective_until', null)
      .single();

    if (error || !data) {
      return null;
    }

    const price = Array.isArray(data.item_prices) ? data.item_prices[0] : data.item_prices;
    return {
      ...data,
      first_image_url: data.item_images?.find(img => img.is_primary)?.image_url || 
                      data.item_images?.[0]?.image_url,
      image_count: data.item_images?.length || 0,
      current_price: price?.selling_price || 0,
      original_price: price?.base_price,
      item_prices: price
    };
  },
  ['mini-app-item-detail'],
  { 
    revalidate: 300, // 5 minutes
    tags: ['items', 'mini-app-item-detail']
  }
);

/**
 * Get categories with cache (1 hour)
 */
export const getCategoriesWithCache = unstable_cache(
  async (projectId: string) => {
    const serviceClient = createServiceRoleClient();

    const { data, error } = await serviceClient
      .from('categories')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return data || [];
  },
  ['mini-app-categories'],
  { 
    revalidate: 3600, // 1 hour
    tags: ['categories', 'mini-app-categories']
  }
);

/**
 * Get related items by category (cached)
 */
export const getRelatedItemsWithCache = unstable_cache(
  async (categoryId: string, excludeItemId: string, limit = 4): Promise<ItemWithPrices[]> => {
    const serviceClient = createServiceRoleClient();

    const { data, error } = await serviceClient
      .from('items')
      .select(`
        *,
        item_prices!inner(
          base_price,
          selling_price,
          effective_from,
          effective_until
        ),
        item_images(
          image_url,
          display_order,
          is_primary
        )
      `)
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .is('item_prices.effective_until', null)
      .gte('stock_quantity', 1)
      .neq('id', excludeItemId)
      .limit(limit);

    if (error) {
      console.error('Error fetching related items:', error);
      return [];
    }

    return (data || []).map(item => {
      const price = Array.isArray(item.item_prices) ? item.item_prices[0] : item.item_prices;
      return {
        ...item,
        first_image_url: item.item_images?.find(img => img.is_primary)?.image_url || 
                        item.item_images?.[0]?.image_url,
        image_count: item.item_images?.length || 0,
        current_price: price?.selling_price || 0,
        original_price: price?.base_price,
        item_prices: price
      };
    });
  },
  ['mini-app-related-items'],
  { 
    revalidate: 600, // 10 minutes
    tags: ['items', 'mini-app-related-items']
  }
);

/**
 * Get project payment methods with cache (1 hour)
 */
export const getPaymentMethodsWithCache = unstable_cache(
  async (projectId: string) => {
    // For now, return default payment methods since the migration hasn't been run
    // TODO: Uncomment after running migration
    /*
    const serviceClient = createServiceRoleClient();

    const { data, error } = await serviceClient
      .from('projects')
      .select('payment_methods')
      .eq('id', projectId)
      .single();

    if (error) {
      console.error('Error fetching payment methods:', error);
      return defaultPaymentMethods;
    }

    return data?.payment_methods || defaultPaymentMethods;
    */
    
    const defaultPaymentMethods = {
      cod_enabled: true,
      delivery_fee: 4000,
      delivery_cities: ["Yangon", "Mandalay", "Naypyidaw"]
    };
    
    return defaultPaymentMethods;
  },
  ['mini-app-payment-methods'],
  { 
    revalidate: 3600, // 1 hour
    tags: ['projects', 'mini-app-payment-methods']
  }
);