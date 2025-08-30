'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, Receipt, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OrderCardProps {
  order: {
    id: string;
    order_number: string;
    status: string | null;
    payment_status: string | null;
    payment_method: string;
    total_amount: number;
    created_at: string | null;
    order_items: Array<{
      id: string;
      quantity: number;
      unit_price: number;
      item_snapshot: {
        name: string;
        image_url?: string;
      };
    }>;
  };
  projectId: string;
}

export function OrderCard({ order, projectId }: OrderCardProps) {
  const router = useRouter();

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; color: string }
    > = {
      pending: { variant: 'secondary', label: 'Processing', color: 'bg-yellow-500' },
      confirmed: { variant: 'default', label: 'Confirmed', color: 'bg-blue-500' },
      paid: { variant: 'default', label: 'Paid', color: 'bg-emerald-500' },
      delivering: { variant: 'default', label: 'Delivering', color: 'bg-orange-500' },
      delivered: { variant: 'default', label: 'Received', color: 'bg-green-500' },
      cancelled: { variant: 'destructive', label: 'Cancelled', color: 'bg-red-500' },
    };
    return statusMap[status] || { variant: 'secondary', label: status, color: 'bg-gray-500' };
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }
    > = {
      pending: { variant: 'outline', label: 'Payment Pending' },
      paid: { variant: 'default', label: 'Paid' },
      failed: { variant: 'destructive', label: 'Payment Failed' },
    };
    return statusMap[status] || { variant: 'outline', label: status };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MM', {
      style: 'currency',
      currency: 'MMK',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-MM', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusInfo = getStatusBadge(order.status || 'pending');
  const paymentInfo = getPaymentStatusBadge(order.payment_status || 'pending');

  const totalItems = order.order_items.reduce((sum, item) => sum + item.quantity, 0);
  const firstItem = order.order_items[0];

  const handleViewOrder = () => {
    router.push(`/app/${projectId}/invoice/${order.id}`);
  };

  return (
    <Card className="border-0 bg-white shadow-sm">
      <CardContent className="p-4">
        {/* Header with order number and status */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-purple-600" />
            <span className="font-mono text-sm font-semibold text-gray-900">
              #{order.order_number}
            </span>
          </div>
          <Badge
            variant={statusInfo.variant}
            className={` ${statusInfo.variant === 'default' ? 'bg-purple-600 hover:bg-purple-700' : ''} ${statusInfo.variant === 'secondary' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : ''} ${statusInfo.variant === 'destructive' ? 'bg-red-100 text-red-800 hover:bg-red-200' : ''} `}
          >
            {statusInfo.label}
          </Badge>
        </div>

        {/* Order Items Preview - Figma style */}
        <div className="mb-4">
          {firstItem && (
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
              {firstItem.item_snapshot.image_url && (
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-white">
                  <Image
                    src={firstItem.item_snapshot.image_url}
                    alt={firstItem.item_snapshot.name}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-900">{firstItem.item_snapshot.name}</p>
                <p className="text-sm text-gray-600">Qty: {firstItem.quantity}</p>
                {order.order_items.length > 1 && (
                  <p className="text-xs text-gray-500">
                    +{order.order_items.length - 1} more item
                    {order.order_items.length > 2 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Order Summary - Figma style */}
        <div className="mb-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total Items</span>
            <span className="font-medium text-gray-900">{totalItems}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Payment</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 capitalize">
                {order.payment_method.replace('_', ' ')}
              </span>
              <Badge
                variant={paymentInfo.variant}
                className={`text-xs ${paymentInfo.variant === 'default' ? 'bg-green-100 text-green-800' : ''}`}
              >
                {paymentInfo.label}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900">Total Amount</span>
            <span className="text-lg font-bold text-purple-600">
              {formatCurrency(order.total_amount)}
            </span>
          </div>
        </div>

        {/* Footer with date and action - Figma style */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <CalendarDays className="h-3 w-3" />
            {formatDate(order.created_at)}
          </div>

          <Button
            size="sm"
            onClick={handleViewOrder}
            className="h-8 bg-purple-600 px-4 py-2 text-xs font-medium text-white hover:bg-purple-700"
          >
            <Eye className="mr-1 h-3 w-3" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
