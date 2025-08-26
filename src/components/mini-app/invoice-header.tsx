'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, Receipt } from 'lucide-react';

interface InvoiceHeaderProps {
  orderNumber: string;
  projectId: string;
}

export function InvoiceHeader({ orderNumber, projectId }: InvoiceHeaderProps) {
  const router = useRouter();

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="space-y-4 px-4 py-4">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-9 w-9 flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/app/${projectId}`)}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>
        </div>

        {/* Header */}
        <div className="text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <div className="rounded-full bg-blue-100 p-2">
              <Receipt className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Order Invoice</h1>
          <div className="inline-block rounded-lg border border-blue-200 bg-blue-50 px-4 py-2">
            <p className="text-lg font-bold text-blue-900">#{orderNumber}</p>
          </div>
          <p className="mt-3 text-sm text-gray-600">Track your order status and details</p>
        </div>
      </div>
    </div>
  );
}
