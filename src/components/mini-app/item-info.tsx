'use client';

import { Badge } from '@/components/ui/badge';
import { Star, Package, Tag } from 'lucide-react';
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

interface ItemInfoProps {
  item: MiniAppItem;
}

export function ItemInfo({ item }: ItemInfoProps) {
  const currentPrice = item.current_price?.selling_price || 0;
  const originalPrice = item.current_price?.base_price;
  const hasDiscount = originalPrice && originalPrice > currentPrice;
  const isOutOfStock = item.stock_quantity <= 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-MM', {
      style: 'currency',
      currency: 'MMK',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-4 px-3 pb-20">
      {/* Category */}
      {item.category && (
        <div className="flex items-center gap-2">
          <Tag className="text-muted-foreground h-3 w-3" />
          <span className="text-muted-foreground text-xs tracking-wide uppercase">
            {item.category.name}
          </span>
        </div>
      )}

      {/* Name */}
      <h1 className="text-xl leading-tight font-bold">{item.name}</h1>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        {item.is_featured && (
          <Badge variant="default" className="bg-yellow-500 px-2 py-1 text-xs text-white">
            <Star className="mr-1 h-2 w-2" />
            Featured
          </Badge>
        )}
        {isOutOfStock && (
          <Badge variant="destructive" className="px-2 py-1 text-xs">
            Out of Stock
          </Badge>
        )}
        {hasDiscount && !isOutOfStock && (
          <Badge variant="secondary" className="bg-green-500 px-2 py-1 text-xs text-white">
            {item.current_price?.discount_percentage}% OFF
          </Badge>
        )}
      </div>

      {/* Price */}
      <div className="space-y-1">
        <div className="flex items-baseline gap-3">
          <span className="text-primary text-2xl font-bold">{formatPrice(currentPrice)}</span>
          {hasDiscount && (
            <span className="text-muted-foreground text-lg line-through">
              {formatPrice(originalPrice!)}
            </span>
          )}
        </div>
        {hasDiscount && (
          <p className="text-sm font-medium text-green-600">
            Save {formatPrice(originalPrice! - currentPrice)}
          </p>
        )}
      </div>

      {/* Stock info */}
      <div className="flex items-center gap-2">
        <Package className="text-muted-foreground h-3 w-3" />
        <span className="text-muted-foreground text-sm">
          {isOutOfStock ? (
            <span className="text-destructive font-medium">Out of stock</span>
          ) : item.stock_quantity <= 5 ? (
            <span className="font-medium text-orange-600">Only {item.stock_quantity} left</span>
          ) : (
            <span className="text-green-600">{item.stock_quantity} in stock</span>
          )}
        </span>
      </div>

      {/* SKU */}
      {item.sku && (
        <p className="text-muted-foreground text-xs">
          <span className="font-medium">SKU:</span> {item.sku}
        </p>
      )}

      {/* Description */}
      {item.description && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Description</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
        </div>
      )}

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Tags</h3>
          <div className="flex flex-wrap gap-1">
            {item.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="px-2 py-0.5 text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
