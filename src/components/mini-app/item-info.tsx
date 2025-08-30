'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Package, Tag, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [showFullDescription, setShowFullDescription] = useState(false);
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

  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-5 px-4 pb-20">
      {/* Category Badge */}
      {item.category && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1">
            <Tag className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {item.category.name}
            </span>
          </div>
        </div>
      )}

      {/* Name Section - Figma style */}
      <div className="space-y-3">
        <h1 className="text-xl leading-tight font-bold text-card-foreground">{item.name}</h1>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          {item.is_featured && (
            <Badge className="bg-gradient-to-r from-chart-3 to-chart-3/80 px-2.5 py-1 text-xs font-medium text-chart-3-foreground shadow-sm">
              <Star className="mr-1 h-2.5 w-2.5 fill-current" />
              Featured
            </Badge>
          )}
          {isOutOfStock && (
            <Badge variant="destructive" className="px-2.5 py-1 text-xs font-medium shadow-sm">
              Out of Stock
            </Badge>
          )}
        </div>
      </div>

      {/* Price Section - Figma style */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          {hasDiscount && (
            <div className="rounded bg-destructive px-2 py-1 text-sm font-bold text-destructive-foreground">
              -{item.current_price?.discount_percentage}%
            </div>
          )}
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-bold text-card-foreground">{formatPrice(currentPrice)}</span>
          {hasDiscount && (
            <span className="text-lg text-muted-foreground line-through">
              {formatPrice(originalPrice!)}
            </span>
          )}
        </div>
        {hasDiscount && (
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-chart-1">
              You save {formatPrice(originalPrice! - currentPrice)}
            </span>
          </div>
        )}
      </div>

      {/* Stock Info */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {isOutOfStock ? (
              <span className="text-destructive">Out of stock</span>
            ) : item.stock_quantity <= 5 ? (
              <span className="text-chart-3">Only {item.stock_quantity} left</span>
            ) : (
              <span className="text-chart-1">{item.stock_quantity} in stock</span>
            )}
          </span>
        </div>
      </div>

      {/* SKU */}
      {item.sku && (
        <p className="text-muted-foreground text-xs">
          <span className="font-medium">SKU:</span> {item.sku}
        </p>
      )}

      {/* Description with Show More - Figma style */}
      {item.description && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-card-foreground">Product Details</h3>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {showFullDescription ? item.description : truncateDescription(item.description)}
            </p>
            {item.description.length > 150 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="mt-2 h-auto p-0 text-sm text-primary hover:text-primary/80"
              >
                {showFullDescription ? (
                  <>
                    Show less <ChevronUp className="ml-1 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Show more <ChevronDown className="ml-1 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-card-foreground">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="rounded-full border-border px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
