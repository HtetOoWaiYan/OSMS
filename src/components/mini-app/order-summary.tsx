'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CartItem } from '@/hooks/use-cart-store';
import { Package } from 'lucide-react';
import Image from 'next/image';

interface OrderSummaryProps {
  items: CartItem[];
}

export function OrderSummary({ items }: OrderSummaryProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-MM', {
      style: 'currency',
      currency: 'MMK',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const deliveryFee = 4000; // Hardcoded delivery fee
  const total = subtotal + deliveryFee;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items List */}
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              {/* Item Image */}
              <div className="bg-muted h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-muted-foreground flex h-full w-full items-center justify-center">
                    <Package className="h-4 w-4" />
                  </div>
                )}
              </div>

              {/* Item Details */}
              <div className="min-w-0 flex-1">
                <h4 className="line-clamp-1 text-sm font-medium">{item.name}</h4>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Qty: {item.quantity}</span>
                  <span className="text-sm font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Price Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal ({items.length} items)</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Delivery Fee</span>
            <span>{formatPrice(deliveryFee)}</span>
          </div>
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span className="text-primary">{formatPrice(total)}</span>
        </div>

        {/* Delivery Notice */}
        <div className="text-muted-foreground bg-muted rounded-lg p-3 text-xs">
          📦 <strong>Delivery Info:</strong> Standard delivery fee applies. Delivery can take up to
          3 days. Orders to non-deliverable areas will be cancelled.
        </div>
      </CardContent>
    </Card>
  );
}
