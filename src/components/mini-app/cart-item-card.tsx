'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QuantitySelector } from './quantity-selector';
import { CartItem, useCartStore } from '@/hooks/use-cart-store';
import { Trash2, Heart } from 'lucide-react';
import { ImagePlaceholder } from '@/components/mini-app/image-placeholder';
import { toast } from 'sonner';
import { useState } from 'react';

interface CartItemCardProps {
  item: CartItem;
  onValidateStock: () => void;
  disabled?: boolean;
}

export function CartItemCard({ item, onValidateStock, disabled = false }: CartItemCardProps) {
  const { updateQuantity, removeItem } = useCartStore();
  const [isFavorited, setIsFavorited] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-MM', {
      style: 'currency',
      currency: 'MMK',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleQuantityChange = (newQuantity: number) => {
    updateQuantity(item.id, newQuantity);
    // Validate stock after quantity change
    setTimeout(() => onValidateStock(), 100);
  };

  const handleRemove = () => {
    removeItem(item.id);
    toast.success(`${item.name} removed from cart`);
  };

  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
  };

  const totalPrice = item.price * item.quantity;
  const isAtMaxStock = item.quantity >= item.maxStock;

  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Item Image */}
          <div className="bg-muted h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl">
            <ImagePlaceholder
              src={item.imageUrl}
              alt={item.name}
              width={80}
              height={80}
              className="h-full w-full object-cover"
              placeholder="product"
            />
          </div>

          {/* Item Details */}
          <div className="min-w-0 flex-1 space-y-3">
            {/* Name and Action Buttons - Figma style */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-card-foreground line-clamp-2 text-sm leading-tight font-semibold">
                {item.name}
              </h3>
              <div className="flex gap-1">
                {/* Heart/Favorite Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleFavorite}
                  disabled={disabled}
                  className={`h-8 w-8 flex-shrink-0 ${
                    isFavorited
                      ? 'text-destructive hover:text-destructive/80'
                      : 'text-muted-foreground hover:text-destructive'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                </Button>

                {/* Delete Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemove}
                  disabled={disabled}
                  className="text-muted-foreground hover:bg-destructive/5 hover:text-destructive h-8 w-8 flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* SKU */}
            {item.sku && (
              <p className="text-muted-foreground text-xs font-medium">SKU: {item.sku}</p>
            )}

            {/* Price and Quantity Row - Figma style layout */}
            <div className="flex items-center justify-between">
              {/* Price Section */}
              <div className="space-y-1">
                <p className="text-card-foreground text-lg font-bold">{formatPrice(totalPrice)}</p>
                <p className="text-muted-foreground text-xs">{formatPrice(item.price)} each</p>
              </div>

              {/* Quantity Section */}
              <div className="flex flex-col items-end gap-1">
                <QuantitySelector
                  value={item.quantity}
                  onChange={handleQuantityChange}
                  min={1}
                  max={item.maxStock}
                  disabled={disabled}
                />
                <p className="text-muted-foreground text-xs font-medium">
                  {item.maxStock} available
                </p>
              </div>
            </div>

            {/* Stock Warning */}
            {isAtMaxStock && (
              <div className="border-chart-3/20 bg-chart-3/5 rounded-lg border px-3 py-2">
                <p className="text-chart-3 text-xs font-medium">
                  ⚠️ Maximum available quantity in cart
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
