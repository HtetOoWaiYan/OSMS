'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
          <Package className="h-5 w-5 text-blue-600" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items List */}
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
              {/* Item Image */}
              <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border bg-white">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    width={56}
                    height={56}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-400">
                    <Package className="h-5 w-5" />
                  </div>
                )}
              </div>

              {/* Item Details */}
              <div className="min-w-0 flex-1">
                <h4 className="line-clamp-2 text-sm leading-tight font-semibold text-gray-900">
                  {item.name}
                </h4>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">Qty: {item.quantity}</span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Price Breakdown */}
        <div className="space-y-3 rounded-lg bg-gray-50 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal ({items.length} items)</span>
            <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Delivery Fee</span>
            <span className="font-medium text-gray-900">{formatPrice(deliveryFee)}</span>
          </div>
        </div>

        {/* Total */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-xl font-bold text-blue-600">{formatPrice(total)}</span>
          </div>
        </div>

        {/* Delivery Notice */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <div className="flex items-start gap-2">
            <span className="text-sm text-amber-600">📦</span>
            <div className="text-xs leading-relaxed text-amber-800">
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
