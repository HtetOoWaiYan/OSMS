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
        <CardTitle className="text-card-foreground flex items-center gap-2 text-lg">
          <ShoppingCart className="text-primary h-5 w-5" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items breakdown */}
        <div className="bg-muted space-y-3 rounded-lg p-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Items ({itemCount})</span>
            <span className="text-card-foreground font-medium">{formatPrice(subtotal)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery Fee</span>
            <span className="text-card-foreground font-medium">{formatPrice(deliveryFee)}</span>
          </div>

          {taxAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span className="text-card-foreground font-medium">{formatPrice(taxAmount)}</span>
            </div>
          )}
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

        {/* Checkout Buttons */}
        <div className="space-y-3 pt-2">
          <Button
            onClick={handleCheckout}
            disabled={!hasItems}
            className="bg-primary hover:bg-primary/90 h-12 w-full font-semibold shadow-sm"
            size="lg"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Proceed to Checkout
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push(`/app/${projectId}`)}
            className="border-border text-muted-foreground hover:bg-muted h-10 w-full font-medium"
          >
            Continue Shopping
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
