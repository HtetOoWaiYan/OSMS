'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CartItem } from '@/hooks/use-cart-store';
import { Package } from 'lucide-react';
import { ImagePlaceholder } from './image-placeholder';

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
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-card-foreground flex items-center gap-2 text-lg">
          <Package className="text-primary h-5 w-5" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items List */}
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-muted flex items-center gap-3 rounded-lg p-3">
              {/* Item Image */}
              <div className="bg-card h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border">
                <ImagePlaceholder
                  src={item.imageUrl || ''}
                  alt={item.name}
                  width={56}
                  height={56}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Item Details */}
              <div className="min-w-0 flex-1">
                <h4 className="text-card-foreground line-clamp-2 text-sm leading-tight font-semibold">
                  {item.name}
                </h4>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-muted-foreground text-xs font-medium">
                    Qty: {item.quantity}
                  </span>
                  <span className="text-card-foreground text-sm font-bold">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Price Breakdown */}
        <div className="bg-muted space-y-3 rounded-lg p-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
            <span className="text-card-foreground font-medium">{formatPrice(subtotal)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery Fee</span>
            <span className="text-card-foreground font-medium">{formatPrice(deliveryFee)}</span>
          </div>
        </div>

        {/* Total */}
        <div className="border-primary/20 bg-primary/5 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <span className="text-card-foreground text-lg font-semibold">Total</span>
            <span className="text-primary text-xl font-bold">{formatPrice(total)}</span>
          </div>
        </div>

        {/* Delivery Notice */}
        <div className="border-chart-3/20 bg-chart-3/5 rounded-lg border p-3">
          <div className="flex items-start gap-2">
            <span className="text-chart-3 text-sm">📦</span>
            <div className="text-chart-3 text-xs leading-relaxed">
              <p className="mb-1 font-semibold">Delivery Information</p>
              <p>
                Standard delivery applies. Delivery takes up to 3 days. Orders to non-deliverable
                areas will be cancelled.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
