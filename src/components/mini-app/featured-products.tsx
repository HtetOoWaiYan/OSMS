'use client';

import { ProductCard } from './product-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Star className="h-5 w-5 fill-current text-yellow-500" />
          Featured Products
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.slice(0, 6).map((item) => (
            <ProductCard key={item.id} item={item} projectId={projectId} compact />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
