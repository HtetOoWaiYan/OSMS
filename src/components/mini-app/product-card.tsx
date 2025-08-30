'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Star } from 'lucide-react';
import { useCartStore } from '@/hooks/use-cart-store';
import { useRouter } from 'next/navigation';
import { ImagePlaceholder } from '@/components/mini-app/image-placeholder';
import { toast } from 'sonner';
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

interface ProductCardProps {
  item: MiniAppItem;
  projectId: string;
  compact?: boolean;
}

export function ProductCard({ item, projectId, compact = false }: ProductCardProps) {
  const router = useRouter();
  const { addItem, isInCart, getCartItem } = useCartStore();

  const currentPrice = item.current_price?.selling_price || 0;
  const originalPrice = item.current_price?.base_price;
  const hasDiscount = originalPrice && originalPrice > currentPrice;
  const isOutOfStock = item.stock_quantity <= 0;
  const cartItem = getCartItem(item.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isOutOfStock) {
      toast.error('This item is out of stock');
      return;
    }

    addItem({
      id: item.id,
      name: item.name,
      price: currentPrice,
      maxStock: item.stock_quantity,
      imageUrl: item.first_image_url,
      sku: item.sku ?? undefined,
    });

    toast.success(`${item.name} added to cart`);
  };

  const handleCardClick = () => {
    router.push(`/app/${projectId}/items/${item.id}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-MM', {
      style: 'currency',
      currency: 'MMK',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card
      className={`cursor-pointer overflow-hidden py-0 transition-all hover:shadow-md active:scale-95 ${
        compact ? 'h-full' : ''
      } ${isOutOfStock ? 'opacity-60' : ''}`}
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        {/* Image */}
        <div className={`relative aspect-square overflow-hidden bg-gray-100`}>
          <ImagePlaceholder
            src={item.first_image_url}
            alt={item.name}
            fill
            className="h-full rounded-t-lg object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
            placeholder="product"
          />

          {/* Discount Badge - Figma style */}
          {hasDiscount && !isOutOfStock && (
            <div className="absolute top-2 left-2">
              <div className="rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white shadow-sm">
                -{item.current_price?.discount_percentage}%
              </div>
            </div>
          )}

          {/* Status Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {item.is_featured && (
              <Badge variant="default" className="h-5 bg-yellow-500 px-2 py-0 text-xs text-white">
                <Star className="mr-1 h-3 w-3 fill-current" />
                Featured
              </Badge>
            )}
            {isOutOfStock && (
              <Badge variant="destructive" className="h-5 px-2 py-0 text-xs">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Add to cart button overlay */}
          {!isOutOfStock && (
            <div className="absolute right-1 bottom-1">
              <Button
                size="icon"
                variant={isInCart(item.id) ? 'default' : 'secondary'}
                className="h-7 w-7 rounded-full shadow-lg"
                onClick={handleAddToCart}
              >
                {isInCart(item.id) ? (
                  <span className="text-xs font-bold">{cartItem?.quantity}</span>
                ) : (
                  <Plus className="h-3 w-3" />
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-1 p-2">
          {/* Name */}
          <h3 className="line-clamp-2 text-sm leading-tight font-semibold">{item.name}</h3>

          {/* Price - Figma style */}
          <div className="flex flex-wrap items-baseline gap-1 break-all">
            <span className="text-lg font-bold text-gray-900">{formatPrice(currentPrice)}</span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                {originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Stock info - compact */}
          <p className="text-muted-foreground text-right text-sm">
            {isOutOfStock ? 'Out of stock' : `${item.stock_quantity} left`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
