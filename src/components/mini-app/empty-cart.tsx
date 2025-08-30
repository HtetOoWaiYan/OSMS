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
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-sm border-0 shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="from-muted to-muted/80 mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br">
            <ShoppingCart className="text-muted-foreground h-12 w-12" />
          </div>

          <h2 className="text-card-foreground mb-3 text-xl font-bold">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8 max-w-sm text-sm leading-relaxed">
            Discover amazing products and add them to your cart. Start your shopping journey now!
          </p>

          <div className="w-full space-y-3">
            <Button
              onClick={() => router.push(`/app/${projectId}`)}
              className="bg-primary hover:bg-primary/90 h-12 w-full font-semibold shadow-sm"
              size="lg"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Start Shopping
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push(`/app/${projectId}/orders`)}
              className="border-border text-muted-foreground hover:bg-muted h-10 w-full font-medium"
            >
              View Past Orders
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
