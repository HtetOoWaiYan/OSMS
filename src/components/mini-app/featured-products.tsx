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
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 px-3">
        <Star className="h-4 w-4 fill-current text-yellow-500" />
        <h2 className="text-lg font-semibold">Featured</h2>
      </div>

      {/* Horizontal scrolling featured items */}
      <div className="overflow-x-auto">
        <div className="flex gap-3 px-3 pb-2" style={{ width: 'max-content' }}>
          {items.slice(0, 8).map((item) => (
            <div key={item.id} className="w-32 flex-shrink-0">
              <ProductCard item={item} projectId={projectId} compact />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
