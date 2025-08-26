'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/hooks/use-cart-store';
import { useRouter } from 'next/navigation';
import { ShoppingCart, CreditCard } from 'lucide-react';

interface CartSummaryProps {
  projectId: string;
  onValidateStock: () => void;
}

export function CartSummary({ projectId, onValidateStock }: CartSummaryProps) {
  const router = useRouter();
  const { getTotal, getItemCount, items } = useCartStore();

  const subtotal = getTotal();
  const deliveryFee = 4000; // Hardcoded delivery fee as per requirements
  const taxAmount = 0; // No tax for MVP
  const total = subtotal + deliveryFee + taxAmount;
  const itemCount = getItemCount();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-MM', {
      style: 'currency',
      currency: 'MMK',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleCheckout = async () => {
    // Validate stock before proceeding to checkout
    onValidateStock();

    // Small delay to allow stock validation to complete
    setTimeout(() => {
      router.push(`/app/${projectId}/checkout`);
    }, 200);
  };

  const hasItems = items.length > 0;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
          <ShoppingCart className="h-5 w-5 text-blue-600" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items breakdown */}
        <div className="space-y-3 rounded-lg bg-gray-50 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Items ({itemCount})</span>
            <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Delivery Fee</span>
            <span className="font-medium text-gray-900">{formatPrice(deliveryFee)}</span>
          </div>

          {taxAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span className="font-medium text-gray-900">{formatPrice(taxAmount)}</span>
            </div>
          )}
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

        {/* Checkout Buttons */}
        <div className="space-y-3 pt-2">
          <Button
            onClick={handleCheckout}
            disabled={!hasItems}
            className="h-12 w-full bg-blue-600 font-semibold shadow-sm hover:bg-blue-700"
            size="lg"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Proceed to Checkout
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push(`/app/${projectId}`)}
            className="h-10 w-full border-gray-300 font-medium text-gray-700 hover:bg-gray-50"
          >
            Continue Shopping
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
