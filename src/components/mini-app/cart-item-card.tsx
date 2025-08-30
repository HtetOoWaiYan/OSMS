'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QuantitySelector } from './quantity-selector';
import { CartItem, useCartStore } from '@/hooks/use-cart-store';
import { Trash2, Heart } from 'lucide-react';
import Image from 'next/image';
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
          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.name}
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-400">
                <span className="text-xs font-medium">No Image</span>
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="min-w-0 flex-1 space-y-3">
            {/* Name and Action Buttons - Figma style */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-2 text-sm leading-tight font-semibold text-gray-900">
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
                      ? 'text-red-500 hover:text-red-600'
                      : 'text-gray-400 hover:text-red-500'
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
                  className="h-8 w-8 flex-shrink-0 text-gray-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* SKU */}
            {item.sku && <p className="text-xs font-medium text-gray-500">SKU: {item.sku}</p>}

            {/* Price and Quantity Row - Figma style layout */}
            <div className="flex items-center justify-between">
              {/* Price Section */}
              <div className="space-y-1">
                <p className="text-lg font-bold text-gray-900">{formatPrice(totalPrice)}</p>
                <p className="text-xs text-gray-500">{formatPrice(item.price)} each</p>
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
                <p className="text-xs font-medium text-gray-500">{item.maxStock} available</p>
              </div>
            </div>

            {/* Stock Warning */}
            {isAtMaxStock && (
              <div className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2">
                <p className="text-xs font-medium text-orange-700">
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
