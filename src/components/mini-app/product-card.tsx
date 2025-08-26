'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ShoppingCart, Star } from 'lucide-react';
import { useCartStore } from '@/hooks/use-cart-store';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
      className={`cursor-pointer transition-all hover:shadow-lg ${
        compact ? 'h-full' : ''
      } ${isOutOfStock ? 'opacity-60' : ''}`}
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        {/* Image */}
        <div className={`relative ${compact ? 'aspect-square' : 'aspect-[4/3]'} bg-muted`}>
          {item.first_image_url ? (
            <Image
              src={item.first_image_url}
              alt={item.name}
              fill
              className="rounded-t-lg object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center">
              <div className="text-center">
                <ShoppingCart className="mx-auto mb-2 h-8 w-8" />
                <p className="text-sm">No Image</p>
              </div>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {item.is_featured && (
              <Badge variant="default" className="bg-yellow-500 text-white">
                <Star className="mr-1 h-3 w-3" />
                Featured
              </Badge>
            )}
            {isOutOfStock && <Badge variant="destructive">Out of Stock</Badge>}
            {hasDiscount && !isOutOfStock && (
              <Badge variant="secondary" className="bg-green-500 text-white">
                {item.current_price?.discount_percentage}% OFF
              </Badge>
            )}
          </div>

          {/* Add to cart button overlay */}
          {!isOutOfStock && (
            <div className="absolute right-2 bottom-2">
              <Button
                size="icon"
                variant={isInCart(item.id) ? 'default' : 'secondary'}
                className="h-8 w-8 rounded-full shadow-lg"
                onClick={handleAddToCart}
              >
                {isInCart(item.id) ? (
                  <span className="text-xs font-bold">{cartItem?.quantity}</span>
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className={`p-3 ${compact ? 'space-y-1' : 'space-y-2'}`}>
          {/* Category */}
          {item.category && !compact && (
            <p className="text-muted-foreground text-xs tracking-wide uppercase">
              {item.category.name}
            </p>
          )}

          {/* Name */}
          <h3 className={`line-clamp-2 font-semibold ${compact ? 'text-sm' : 'text-base'}`}>
            {item.name}
          </h3>

          {/* SKU */}
          {item.sku && !compact && <p className="text-muted-foreground text-xs">SKU: {item.sku}</p>}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className={`font-bold ${compact ? 'text-sm' : 'text-lg'} text-primary`}>
              {formatPrice(currentPrice)}
            </span>
            {hasDiscount && (
              <span className="text-muted-foreground text-xs line-through">
                {formatPrice(originalPrice!)}
              </span>
            )}
          </div>

          {/* Stock info */}
          {!compact && (
            <p className="text-muted-foreground text-xs">
              {isOutOfStock ? 'Out of stock' : `${item.stock_quantity} in stock`}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
