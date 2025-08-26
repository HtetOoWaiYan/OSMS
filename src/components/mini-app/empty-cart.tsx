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
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
            <ShoppingCart className="h-12 w-12 text-gray-400" />
          </div>

          <h2 className="mb-3 text-xl font-bold text-gray-900">Your cart is empty</h2>
          <p className="mb-8 max-w-sm text-sm leading-relaxed text-gray-600">
            Discover amazing products and add them to your cart. Start your shopping journey now!
          </p>

          <div className="w-full space-y-3">
            <Button
              onClick={() => router.push(`/app/${projectId}`)}
              className="h-12 w-full bg-blue-600 font-semibold shadow-sm hover:bg-blue-700"
              size="lg"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Start Shopping
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push(`/app/${projectId}/orders`)}
              className="h-10 w-full border-gray-300 font-medium text-gray-700 hover:bg-gray-50"
            >
              View Past Orders
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
