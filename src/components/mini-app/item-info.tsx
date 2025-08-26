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
    <div className="space-y-5 px-4 pb-20">
      {/* Category Badge */}
      {item.category && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1">
            <Tag className="h-3 w-3 text-gray-500" />
            <span className="text-xs font-medium tracking-wide text-gray-600 uppercase">
              {item.category.name}
            </span>
          </div>
        </div>
      )}

      {/* Name and Badges Section */}
      <div className="space-y-3">
        <h1 className="text-2xl leading-tight font-bold text-gray-900">{item.name}</h1>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          {item.is_featured && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 px-2.5 py-1 text-xs font-medium text-white shadow-sm">
              <Star className="mr-1 h-2.5 w-2.5 fill-current" />
              Featured
            </Badge>
          )}
          {isOutOfStock && (
            <Badge variant="destructive" className="px-2.5 py-1 text-xs font-medium shadow-sm">
              Out of Stock
            </Badge>
          )}
          {hasDiscount && !isOutOfStock && (
            <Badge className="bg-gradient-to-r from-green-500 to-green-600 px-2.5 py-1 text-xs font-medium text-white shadow-sm">
              {item.current_price?.discount_percentage}% OFF
            </Badge>
          )}
        </div>
      </div>

      {/* Price Section */}
      <div className="space-y-2 rounded-lg bg-gray-50 p-4">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-gray-900">{formatPrice(currentPrice)}</span>
          {hasDiscount && (
            <span className="text-lg text-gray-500 line-through">
              {formatPrice(originalPrice!)}
            </span>
          )}
        </div>
        {hasDiscount && (
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-green-600">
              You save {formatPrice(originalPrice! - currentPrice)}
            </span>
          </div>
        )}
      </div>

      {/* Stock Info */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-md border bg-white px-3 py-2">
          <Package className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">
            {isOutOfStock ? (
              <span className="text-red-600">Out of stock</span>
            ) : item.stock_quantity <= 5 ? (
              <span className="text-orange-600">Only {item.stock_quantity} left</span>
            ) : (
              <span className="text-green-600">{item.stock_quantity} in stock</span>
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

      {/* Description */}
      {item.description && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-gray-900">Product Details</h3>
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm leading-relaxed text-gray-700">{item.description}</p>
          </div>
        </div>
      )}

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-gray-900">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="rounded-full border-gray-300 px-3 py-1 text-xs font-medium text-gray-700"
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
