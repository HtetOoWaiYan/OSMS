'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
      pending: { variant: 'secondary', label: 'Pending', color: 'bg-yellow-500' },
      confirmed: { variant: 'default', label: 'Confirmed', color: 'bg-blue-500' },
      paid: { variant: 'default', label: 'Paid', color: 'bg-emerald-500' },
      delivering: { variant: 'default', label: 'Delivering', color: 'bg-orange-500' },
      delivered: { variant: 'default', label: 'Delivered', color: 'bg-green-500' },
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
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="text-muted-foreground h-4 w-4" />
            <span className="font-mono text-sm font-medium">#{order.order_number}</span>
          </div>
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Order Items Preview */}
        <div className="space-y-2">
          {/* First item with image */}
          {firstItem && (
            <div className="flex items-center gap-3">
              {firstItem.item_snapshot.image_url && (
                <div className="bg-muted h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
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
                <p className="truncate text-sm font-medium">{firstItem.item_snapshot.name}</p>
                <p className="text-muted-foreground text-xs">Qty: {firstItem.quantity}</p>
              </div>
            </div>
          )}

          {/* Additional items count */}
          {order.order_items.length > 1 && (
            <p className="text-muted-foreground text-xs">
              +{order.order_items.length - 1} more item{order.order_items.length > 2 ? 's' : ''}
            </p>
          )}
        </div>

        <Separator />

        {/* Order Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Items</span>
            <span className="font-medium">{totalItems}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Payment Method</span>
            <span className="font-medium capitalize">{order.payment_method.replace('_', ' ')}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Payment Status</span>
            <Badge variant={paymentInfo.variant} className="text-xs">
              {paymentInfo.label}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total Amount</span>
            <span className="text-lg font-bold">{formatCurrency(order.total_amount)}</span>
          </div>
        </div>

        <Separator />

        {/* Order Date and Actions */}
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground flex items-center gap-1 text-xs">
            <CalendarDays className="h-3 w-3" />
            {formatDate(order.created_at)}
          </div>

          <Button size="sm" variant="outline" onClick={handleViewOrder}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
