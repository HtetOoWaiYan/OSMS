'use client';

import { ProductCard } from './product-card';

interface ProductGridProps {
  items: Array<{
    id: string;
    name: string;
    current_price?: number;
    original_price?: number;
    stock_quantity: number;
    first_image_url?: string;
  }>;
  isLoading?: boolean;
}

export function ProductGrid({ items, isLoading = false }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card border rounded-lg overflow-hidden animate-pulse">
            <div className="aspect-square bg-muted" />
            <div className="p-4">
              <div className="h-4 bg-muted rounded mb-2" />
              <div className="h-3 bg-muted rounded w-2/3 mb-3" />
              <div className="h-8 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🛍️</div>
        <h3 className="text-lg font-medium text-muted-foreground mb-2">No products found</h3>
        <p className="text-sm text-muted-foreground">
          Try adjusting your search or check back later
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {items.map((item) => (
        <ProductCard key={item.id} item={item} />
      ))}
    </div>
  );
}