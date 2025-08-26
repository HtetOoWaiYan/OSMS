import 'server-only';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { unstable_cache } from 'next/cache';
import type { Tables } from '@/lib/supabase/database.types';

// Types for mini-app
type MiniAppItem = Tables<'items'> & {
  current_price?: Tables<'item_prices'> | null;
  category?: Tables<'categories'> | null;
  item_images?: Array<{
    image_url: string;
    is_primary: boolean | null;
  }>;
  first_image_url?: string;
};

type MiniAppCategory = Tables<'categories'>;

export interface ItemFilters {
  search?: string;
  category?: string;
  sort?: 'name' | 'price' | 'created_at';
  order?: 'asc' | 'desc';
}

/**
 * Get active items for mini-app with caching
 */
export const getItemsForMiniApp = unstable_cache(
  async (projectId: string, filters?: ItemFilters): Promise<MiniAppItem[]> => {
    const serviceClient = createServiceRoleClient();

    let query = serviceClient
      .from('items')
      .select(
        `
        *,
        categories!inner(
          id,
          name,
          description
        ),
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
          is_primary
        )
      `,
      )
      .eq('project_id', projectId)
      .eq('is_active', true);

    // Apply filters
    if (filters?.category) {
      query = query.eq('category_id', filters.category);
    }

    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    // Apply sorting
    const sortBy = filters?.sort || 'created_at';
    const sortOrder = filters?.order || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching items for mini-app:', error);
      return [];
    }

    // Transform data to include current price and first image
    return (
      data?.map((item) => {
        // Get current active price
        const activePrices = item.item_prices?.filter((p) => p && p.is_active) || [];
        const currentPrice =
          activePrices.length > 0
            ? activePrices.sort(
                (a, b) =>
                  new Date(b.effective_from!).getTime() - new Date(a.effective_from!).getTime(),
              )[0]
            : null;

        // Get first image URL - prefer primary image
        let firstImageUrl: string | undefined = undefined;
        if (item.item_images && item.item_images.length > 0) {
          const primaryImage = item.item_images.find((img) => img.is_primary);
          firstImageUrl = primaryImage?.image_url || item.item_images[0]?.image_url;
        }

        // Transform to match MiniAppItem type
        const transformedItem: MiniAppItem = {
          ...item,
          current_price: currentPrice
            ? {
                base_price: currentPrice.base_price,
                created_at: null, // Not available in the query, but required by type
                discount_percentage: currentPrice.discount_percentage,
                effective_from: currentPrice.effective_from,
                effective_until: currentPrice.effective_until || null,
                id: currentPrice.id,
                is_active: currentPrice.is_active,
                item_id: item.id, // Set from parent item
                selling_price: currentPrice.selling_price,
              }
            : null,
          first_image_url: firstImageUrl,
        };

        return transformedItem;
      }) || []
    );
  },
  ['mini-app-items'],
  { revalidate: 300, tags: ['items'] }, // 5 minute cache
);

/**
 * Get featured items for mini-app home page
 */
export const getFeaturedItemsForMiniApp = unstable_cache(
  async (projectId: string): Promise<MiniAppItem[]> => {
    const items = await getItemsForMiniApp(projectId);
    return items.filter((item) => item.is_featured).slice(0, 6); // Limit to 6 featured items
  },
  ['mini-app-featured-items'],
  { revalidate: 300, tags: ['items'] },
);

/**
 * Get categories for mini-app
 */
export const getCategoriesForMiniApp = unstable_cache(
  async (projectId: string): Promise<MiniAppCategory[]> => {
    const serviceClient = createServiceRoleClient();

    const { data, error } = await serviceClient
      .from('categories')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories for mini-app:', error);
      return [];
    }

    return data || [];
  },
  ['mini-app-categories'],
  { revalidate: 3600, tags: ['categories'] }, // 1 hour cache
);

/**
 * Get single item details for mini-app
 */
export const getItemDetailForMiniApp = unstable_cache(
  async (itemId: string): Promise<MiniAppItem | null> => {
    const serviceClient = createServiceRoleClient();

    const { data, error } = await serviceClient
      .from('items')
      .select(
        `
        *,
        categories(
          id,
          name,
          description
        ),
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
          is_primary,
          display_order
        )
      `,
      )
      .eq('id', itemId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching item detail:', error);
      return null;
    }

    // Transform data
    const activePrices = data.item_prices?.filter((p) => p && p.is_active) || [];
    const currentPrice =
      activePrices.length > 0
        ? activePrices.sort(
            (a, b) => new Date(b.effective_from!).getTime() - new Date(a.effective_from!).getTime(),
          )[0]
        : null;

    // Get all images sorted by display order
    const sortedImages =
      data.item_images?.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)) || [];

    const firstImageUrl =
      sortedImages.find((img) => img.is_primary)?.image_url || sortedImages[0]?.image_url;

    const transformedItem: MiniAppItem = {
      ...data,
      current_price: currentPrice
        ? {
            base_price: currentPrice.base_price,
            created_at: null,
            discount_percentage: currentPrice.discount_percentage,
            effective_from: currentPrice.effective_from,
            effective_until: currentPrice.effective_until || null,
            id: currentPrice.id,
            is_active: currentPrice.is_active,
            item_id: data.id,
            selling_price: currentPrice.selling_price,
          }
        : null,
      first_image_url: firstImageUrl,
      item_images: sortedImages,
    };

    return transformedItem;
  },
  ['mini-app-item-detail'],
  { revalidate: 300, tags: ['items'] },
);

/**
 * Get related items for mini-app (same category)
 */
export const getRelatedItemsForMiniApp = unstable_cache(
  async (categoryId: string, excludeItemId: string): Promise<MiniAppItem[]> => {
    const serviceClient = createServiceRoleClient();

    const { data, error } = await serviceClient
      .from('items')
      .select(
        `
        *,
        categories(
          id,
          name
        ),
        item_prices!left(
          id,
          base_price,
          selling_price,
          discount_percentage,
          is_active,
          effective_from
        ),
        item_images!left(
          image_url,
          is_primary
        )
      `,
      )
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .neq('id', excludeItemId)
      .limit(4);

    if (error) {
      console.error('Error fetching related items:', error);
      return [];
    }

    return (
      data?.map((item) => {
        const activePrices = item.item_prices?.filter((p) => p && p.is_active) || [];
        const currentPrice =
          activePrices.length > 0
            ? activePrices.sort(
                (a, b) =>
                  new Date(b.effective_from!).getTime() - new Date(a.effective_from!).getTime(),
              )[0]
            : null;

        const firstImageUrl =
          item.item_images?.find((img) => img.is_primary)?.image_url ||
          item.item_images?.[0]?.image_url;

        const transformedItem: MiniAppItem = {
          ...item,
          current_price: currentPrice
            ? {
                base_price: currentPrice.base_price || 0,
                created_at: null,
                discount_percentage: currentPrice.discount_percentage,
                effective_from: currentPrice.effective_from,
                effective_until: null,
                id: currentPrice.id,
                is_active: currentPrice.is_active,
                item_id: item.id,
                selling_price: currentPrice.selling_price,
              }
            : null,
          first_image_url: firstImageUrl,
        };

        return transformedItem;
      }) || []
    );
  },
  ['mini-app-related-items'],
  { revalidate: 600, tags: ['items'] }, // 10 minute cache
);

/**
 * Payment methods configuration type
 */
interface PaymentMethodsConfig {
  cod_enabled?: boolean;
  delivery_fee?: number;
  delivery_cities?: string[];
  delivery_notice?: string;
  [key: string]: unknown; // For payment method specific configs
}

/**
 * Get project payment methods
 */
export const getPaymentMethodsForMiniApp = unstable_cache(
  async (projectId: string): Promise<PaymentMethodsConfig> => {
    const serviceClient = createServiceRoleClient();

    const { data, error } = await serviceClient
      .from('projects')
      .select('payment_methods')
      .eq('id', projectId)
      .single();

    if (error) {
      console.error('Error fetching payment methods:', error);
      return {
        cod_enabled: true,
        delivery_fee: 4000,
        delivery_cities: ['Yangon', 'Mandalay', 'Naypyidaw'],
        delivery_notice: 'Delivery can take up to 3 days.',
      };
    }

    return (
      (data?.payment_methods as PaymentMethodsConfig) || {
        cod_enabled: true,
        delivery_fee: 4000,
        delivery_cities: ['Yangon', 'Mandalay', 'Naypyidaw'],
        delivery_notice: 'Delivery can take up to 3 days.',
      }
    );
  },
  ['mini-app-payment-methods'],
  { revalidate: 3600, tags: ['payment-methods'] },
);
