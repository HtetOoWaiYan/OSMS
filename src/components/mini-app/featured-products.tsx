'use client';

import { ProductCard } from './product-card';
import { Star } from 'lucide-react';
import type { Tables } from '@/lib/supabase/database.types';

// MiniAppItem type to match the data structure
type MiniAppItem = Tables<'items'> & {
  current_price?: Tables<'item_prices'> | null;
  category?: Tables<'categories'> | null;
  item_images?: Array<{
    image_url: string;
    is_primary: boolean | null;
  }>;
  first_image_url?: string;
};

interface FeaturedProductsProps {
  items: MiniAppItem[];
  projectId: string;
}

export function FeaturedProducts({ items, projectId }: FeaturedProductsProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="text-chart-3 h-5 w-5 fill-current" />
          <h2 className="text-card-foreground text-lg font-bold">Featured Products</h2>
        </div>
        <span className="text-muted-foreground text-sm font-medium">{items.length} items</span>
      </div>

      {/* Horizontal scrolling featured items */}
      <div className="-mx-4 overflow-x-auto">
        <div className="flex gap-3 px-4 pb-2" style={{ width: 'max-content' }}>
          {items.slice(0, 8).map((item) => (
            <div key={item.id} className="w-42 flex-shrink-0">
              <ProductCard item={item} projectId={projectId} compact />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
