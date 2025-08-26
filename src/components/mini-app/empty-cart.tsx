'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EmptyCartProps {
  projectId: string;
}

export function EmptyCart({ projectId }: EmptyCartProps) {
  const router = useRouter();

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-muted mb-6 flex h-20 w-20 items-center justify-center rounded-full">
          <ShoppingCart className="text-muted-foreground h-10 w-10" />
        </div>

        <h2 className="mb-2 text-xl font-semibold">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Looks like you haven&apos;t added anything to your cart yet. Start shopping to fill it up!
        </p>

        <div className="w-full max-w-xs space-y-3">
          <Button onClick={() => router.push(`/app/${projectId}`)} className="w-full" size="lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Start Shopping
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push(`/app/${projectId}/orders`)}
            className="w-full"
          >
            View Past Orders
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
