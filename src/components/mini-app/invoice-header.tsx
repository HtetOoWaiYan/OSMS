'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

interface InvoiceHeaderProps {
  orderNumber: string;
  projectId?: string;
}

export function InvoiceHeader({ orderNumber }: InvoiceHeaderProps) {
  const router = useRouter();

  return (
    <div className="border-border bg-card border-b">
      <div className="px-4 py-4">
        {/* Navigation */}
        <div className="mb-6 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-9 w-9 flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-card-foreground text-lg font-semibold">Order Confirmation</h1>
          </div>
        </div>

        {/* Order Status - Figma style */}
        <div className="text-center">
          <div className="mb-4">
            <CheckCircle2 className="text-chart-1 mx-auto mb-3 h-16 w-16" />
            <h2 className="text-card-foreground mb-1 text-xl font-bold">Order Processing</h2>
            <p className="text-muted-foreground text-sm">Your order has been confirmed</p>
          </div>

          <div className="border-chart-1/20 bg-chart-1/5 inline-block rounded-lg border px-4 py-3">
            <p className="text-chart-1 font-medium">Order #{orderNumber}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
