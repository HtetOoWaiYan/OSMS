'use client';

import { ProductCard } from './product-card';
import { ProductFilters } from './product-filters';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingBag, Filter } from 'lucide-react';
import { useState } from 'react';
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

interface ProductGridProps {
  items: MiniAppItem[];
  categories: Tables<'categories'>[];
  projectId: string;
  title?: string;
}

export function ProductGrid({
  items,
  categories,
  projectId,
  title = 'All Products',
}: ProductGridProps) {
  const [showFilters, setShowFilters] = useState(false);

  if (!items || items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ShoppingBag className="text-muted-foreground mb-4 h-12 w-12" />
          <h3 className="text-muted-foreground mb-2 text-lg font-semibold">No Products Found</h3>
          <p className="text-muted-foreground text-center text-sm">
            There are no products available at the moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 px-4 pb-6">
      {/* Header with filters toggle */}
      <div className="flex items-center justify-between pt-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <p className="mt-0.5 text-xs text-gray-500">
            {items.length} product{items.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex h-8 items-center gap-1 px-3"
        >
          <Filter className="h-3 w-3" />
          <span className="text-xs">Filter</span>
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="mx-0">
          <CardContent className="p-3">
            <ProductFilters
              categories={categories.map((cat) => ({
                id: cat.id,
                name: cat.name,
                description: cat.description ?? undefined,
              }))}
              projectId={projectId}
            />
          </CardContent>
        </Card>
      )}

      {/* Products grid - Mobile optimized 2 columns */}
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <ProductCard key={item.id} item={item} projectId={projectId} compact />
        ))}
      </div>
    </div>
  );
}
