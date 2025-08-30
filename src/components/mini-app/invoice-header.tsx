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
    <div className="border-b border-gray-200 bg-white">
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
            <h1 className="text-lg font-semibold text-gray-900">Order Confirmation</h1>
          </div>
        </div>

        {/* Order Status - Figma style */}
        <div className="text-center">
          <div className="mb-4">
            <CheckCircle2 className="mx-auto mb-3 h-16 w-16 text-green-500" />
            <h2 className="mb-1 text-xl font-bold text-gray-900">Order Processing</h2>
            <p className="text-sm text-gray-600">Your order has been confirmed</p>
          </div>

          <div className="inline-block rounded-lg border border-green-200 bg-green-50 px-4 py-3">
            <p className="font-medium text-green-800">Order #{orderNumber}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
