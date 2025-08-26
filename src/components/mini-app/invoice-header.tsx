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
    <div className="space-y-4">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <Button variant="outline" size="sm" onClick={() => router.push(`/app/${projectId}`)}>
          <Home className="mr-2 h-4 w-4" />
          Home
        </Button>
      </div>

      {/* Header */}
      <div className="text-center">
        <div className="mb-2 flex items-center justify-center gap-2">
          <Receipt className="text-primary h-6 w-6" />
          <h1 className="text-xl font-bold">Order Invoice</h1>
        </div>
        <p className="text-primary text-lg font-semibold">#{orderNumber}</p>
        <p className="text-muted-foreground text-sm">Track your order status and details</p>
      </div>
    </div>
  );
}
