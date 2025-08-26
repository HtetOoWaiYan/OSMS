'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MiniAppLayout } from '@/components/mini-app/mini-app-layout';
import { CheckoutForm } from '@/components/mini-app/checkout-form';
import { OrderSummary } from '@/components/mini-app/order-summary';
import { useCartStore } from '@/hooks/use-cart-store';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CheckoutPageProps {
  params: Promise<{ 'project-id': string }>;
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string>('');
  const { items, getTotal, getItemCount } = useCartStore();

  useEffect(() => {
    params.then(({ 'project-id': id }) => setProjectId(id));
  }, [params]);

  // Redirect to cart if no items
  useEffect(() => {
    if (projectId && items.length === 0) {
      router.push(`/app/${projectId}/cart`);
    }
  }, [items.length, projectId, router]);

  if (!projectId) {
    return (
      <MiniAppLayout projectId="">
        <div className="container mx-auto max-w-md px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="bg-muted h-8 rounded"></div>
            <div className="bg-muted h-64 rounded"></div>
          </div>
        </div>
      </MiniAppLayout>
    );
  }

  if (items.length === 0) {
    return (
      <MiniAppLayout projectId={projectId}>
        <div className="container mx-auto max-w-md px-4 py-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="text-muted-foreground mb-4 h-12 w-12" />
              <h2 className="mb-2 text-xl font-semibold">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Add some items to your cart before checking out.
              </p>
              <Button onClick={() => router.push(`/app/${projectId}`)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </MiniAppLayout>
    );
  }

  return (
    <MiniAppLayout projectId={projectId} showBottomNav={false}>
      <div className="container mx-auto max-w-md space-y-6 px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Checkout</h1>
            <p className="text-muted-foreground text-sm">
              {getItemCount()} items •{' '}
              {new Intl.NumberFormat('en-MM', {
                style: 'currency',
                currency: 'MMK',
                minimumFractionDigits: 0,
              }).format(getTotal())}
            </p>
          </div>
        </div>

        {/* Order Summary */}
        <OrderSummary items={items} />

        {/* Checkout Form */}
        <CheckoutForm projectId={projectId} />
      </div>
    </MiniAppLayout>
  );
}
