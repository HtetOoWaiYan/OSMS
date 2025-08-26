'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Items ({itemCount})</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Delivery Fee</span>
            <span>{formatPrice(deliveryFee)}</span>
          </div>

          {taxAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <span>{formatPrice(taxAmount)}</span>
            </div>
          )}
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

        {/* Checkout Button */}
        <Button onClick={handleCheckout} disabled={!hasItems} className="w-full" size="lg">
          <CreditCard className="mr-2 h-4 w-4" />
          Proceed to Checkout
        </Button>

        {/* Continue Shopping */}
        <Button
          variant="outline"
          onClick={() => router.push(`/app/${projectId}`)}
          className="w-full"
        >
          Continue Shopping
        </Button>
      </CardContent>
    </Card>
  );
}
