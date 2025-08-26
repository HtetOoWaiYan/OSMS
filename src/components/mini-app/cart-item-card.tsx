'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QuantitySelector } from './quantity-selector';
import { CartItem, useCartStore } from '@/hooks/use-cart-store';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

interface CartItemCardProps {
  item: CartItem;
  onValidateStock: () => void;
  disabled?: boolean;
}

export function CartItemCard({ item, onValidateStock, disabled = false }: CartItemCardProps) {
  const { updateQuantity, removeItem } = useCartStore();

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

  const totalPrice = item.price * item.quantity;
  const isAtMaxStock = item.quantity >= item.maxStock;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* Item Image */}
          <div className="bg-muted h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.name}
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-muted-foreground flex h-full w-full items-center justify-center">
                <span className="text-xs">No Image</span>
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="min-w-0 flex-1 space-y-2">
            {/* Name and Remove Button */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-2 text-sm leading-tight font-semibold">{item.name}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemove}
                disabled={disabled}
                className="text-muted-foreground hover:text-destructive h-8 w-8"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* SKU */}
            {item.sku && <p className="text-muted-foreground text-xs">SKU: {item.sku}</p>}

            {/* Price */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">{formatPrice(item.price)} each</p>
                <p className="text-primary text-lg font-bold">{formatPrice(totalPrice)}</p>
              </div>

              {/* Quantity Selector */}
              <div className="flex flex-col items-end gap-1">
                <QuantitySelector
                  value={item.quantity}
                  onChange={handleQuantityChange}
                  min={1}
                  max={item.maxStock}
                  disabled={disabled}
                />
                <p className="text-muted-foreground text-xs">{item.maxStock} available</p>
              </div>
            </div>

            {/* Stock Warning */}
            {isAtMaxStock && (
              <div className="rounded bg-orange-50 p-2 text-xs text-orange-600">
                ⚠️ Maximum available quantity in cart
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
