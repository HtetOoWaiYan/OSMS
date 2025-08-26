'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
    <Card>
      <CardContent className="space-y-4 p-6">
        {/* Quantity Selector */}
        {!isOutOfStock && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Quantity</label>
            <div className="flex items-center gap-4">
              <QuantitySelector
                value={selectedQuantity}
                onChange={setSelectedQuantity}
                min={1}
                max={maxSelectableQuantity}
                disabled={isOutOfStock}
              />
              <span className="text-muted-foreground text-sm">
                {isInCart && <span>({cartItem.quantity} already in cart) •</span>}
                {item.stock_quantity} available
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock || maxSelectableQuantity === 0}
            className="w-full"
            size="lg"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {isOutOfStock ? 'Out of Stock' : isInCart ? 'Update Cart' : 'Add to Cart'}
          </Button>

          {/* Buy Now Button */}
          {!isOutOfStock && (
            <Button onClick={handleBuyNow} variant="outline" className="w-full" size="lg">
              Buy Now
            </Button>
          )}
        </div>

        {/* Stock Warning */}
        {!isOutOfStock && item.stock_quantity <= 5 && (
          <div className="rounded bg-orange-50 p-2 text-center text-sm text-orange-600">
            ⚠️ Only {item.stock_quantity} left in stock!
          </div>
        )}

        {/* Cart Info */}
        {isInCart && (
          <div className="text-muted-foreground bg-muted rounded p-2 text-center text-sm">
            You have {cartItem.quantity} of this item in your cart
          </div>
        )}
      </CardContent>
    </Card>
  );
}
