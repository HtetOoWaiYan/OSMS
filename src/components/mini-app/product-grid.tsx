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
    <div className="space-y-4">
      {/* Header with filters toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
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

      {/* Product count */}
      <p className="text-muted-foreground text-sm">
        {items.length} product{items.length !== 1 ? 's' : ''} found
      </p>

      {/* Products grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <ProductCard key={item.id} item={item} projectId={projectId} />
        ))}
      </div>
    </div>
  );
}
