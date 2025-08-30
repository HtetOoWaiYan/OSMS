'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { QuantitySelector } from './quantity-selector';
import { useCartStore } from '@/hooks/use-cart-store';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
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

interface AddToCartSectionProps {
  item: MiniAppItem;
}

export function AddToCartSection({ item }: AddToCartSectionProps) {
  const router = useRouter();
  const { addItem, getCartItem, updateQuantity } = useCartStore();
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const currentPrice = item.current_price?.selling_price || 0;
  const isOutOfStock = item.stock_quantity <= 0;
  const cartItem = getCartItem(item.id);
  const isInCart = !!cartItem;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error('This item is out of stock');
      return;
    }

    if (isInCart) {
      // Update existing cart item quantity
      const newQuantity = Math.min(cartItem.quantity + selectedQuantity, item.stock_quantity);
      updateQuantity(item.id, newQuantity);
      toast.success(`Updated ${item.name} quantity in cart`);
    } else {
      // Add new item to cart
      addItem({
        id: item.id,
        name: item.name,
        price: currentPrice,
        quantity: selectedQuantity,
        maxStock: item.stock_quantity,
        imageUrl: item.first_image_url,
        sku: item.sku ?? undefined,
      });
      toast.success(`${item.name} added to cart`);
    }
  };

  const handleBuyNow = () => {
    // Add to cart first
    handleAddToCart();
    // Then navigate to cart
    router.push(`/app/${router}/cart`);
  };

  const maxSelectableQuantity = isInCart
    ? Math.max(1, item.stock_quantity - cartItem.quantity)
    : item.stock_quantity;

  return (
    <div className="safe-area-inset-bottom border-border bg-card fixed right-0 bottom-0 left-0 z-40 border-t shadow-lg">
      <div className="mx-auto max-w-md space-y-4 p-4">
        {/* Quantity Selector */}
        {!isOutOfStock && (
          <div className="bg-muted flex items-center justify-between rounded-lg p-3">
            <span className="text-card-foreground text-sm font-medium">Quantity:</span>
            <div className="flex items-center gap-3">
              <QuantitySelector
                value={selectedQuantity}
                onChange={setSelectedQuantity}
                min={1}
                max={maxSelectableQuantity}
                disabled={isOutOfStock}
              />
              <span className="text-muted-foreground text-xs font-medium">
                {item.stock_quantity} available
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock || maxSelectableQuantity === 0}
            className="bg-primary hover:bg-primary/90 h-12 flex-1 font-medium shadow-sm"
            size="lg"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {isOutOfStock ? 'Out of Stock' : isInCart ? 'Update Cart' : 'Add to Cart'}
          </Button>

          {/* Buy Now Button */}
          {!isOutOfStock && (
            <Button
              onClick={handleBuyNow}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/5 h-12 flex-1 font-medium"
              size="lg"
            >
              Buy Now
            </Button>
          )}
        </div>

        {/* Status Messages */}
        <div className="space-y-2">
          {/* Stock Warning */}
          {!isOutOfStock && item.stock_quantity <= 5 && (
            <div className="border-chart-3/20 bg-chart-3/5 rounded-lg border px-3 py-2 text-center">
              <div className="flex items-center justify-center gap-1">
                <span className="text-chart-3 text-sm font-medium">
                  ⚠️ Only {item.stock_quantity} left in stock!
                </span>
              </div>
            </div>
          )}

          {/* Cart Info */}
          {isInCart && (
            <div className="border-primary/20 bg-primary/5 rounded-lg border px-3 py-2 text-center">
              <span className="text-primary text-sm font-medium">
                ✓ {cartItem.quantity} item{cartItem.quantity > 1 ? 's' : ''} in cart
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
