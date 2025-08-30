'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, Receipt, Eye } from 'lucide-react';
import { ImagePlaceholder } from '@/components/mini-app/image-placeholder';
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
      pending: { variant: 'secondary', label: 'Processing', color: 'bg-chart-3' },
      confirmed: { variant: 'default', label: 'Confirmed', color: 'bg-primary' },
      paid: { variant: 'default', label: 'Paid', color: 'bg-chart-1' },
      delivering: { variant: 'default', label: 'Delivering', color: 'bg-chart-3' },
      delivered: { variant: 'default', label: 'Received', color: 'bg-chart-1' },
      cancelled: { variant: 'destructive', label: 'Cancelled', color: 'bg-destructive' },
    };
    return statusMap[status] || { variant: 'secondary', label: status, color: 'bg-muted' };
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
    <Card className="bg-card border-0 shadow-sm">
      <CardContent className="p-4">
        {/* Header with order number and status */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="text-chart-2 h-4 w-4" />
            <span className="text-card-foreground font-mono text-sm font-semibold">
              #{order.order_number}
            </span>
          </div>
          <Badge
            variant={statusInfo.variant}
            className={` ${statusInfo.variant === 'default' ? 'bg-chart-2 hover:bg-chart-2/90' : ''} ${statusInfo.variant === 'secondary' ? 'bg-chart-3/10 text-chart-3 hover:bg-chart-3/20' : ''} ${statusInfo.variant === 'destructive' ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' : ''} `}
          >
            {statusInfo.label}
          </Badge>
        </div>

        {/* Order Items Preview - Figma style */}
        <div className="mb-4">
          {firstItem && (
            <div className="bg-muted flex items-center gap-3 rounded-lg p-3">
              <div className="bg-card h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                <ImagePlaceholder
                  src={firstItem.item_snapshot.image_url || ''}
                  alt={firstItem.item_snapshot.name}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-card-foreground truncate font-medium">
                  {firstItem.item_snapshot.name}
                </p>
                <p className="text-muted-foreground text-sm">Qty: {firstItem.quantity}</p>
                {order.order_items.length > 1 && (
                  <p className="text-muted-foreground text-xs">
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
            <span className="text-muted-foreground">Total Items</span>
            <span className="text-card-foreground font-medium">{totalItems}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Payment</span>
            <div className="flex items-center gap-2">
              <span className="text-card-foreground font-medium capitalize">
                {order.payment_method.replace('_', ' ')}
              </span>
              <Badge
                variant={paymentInfo.variant}
                className={`text-xs ${paymentInfo.variant === 'default' ? 'bg-chart-1/10 text-chart-1' : ''}`}
              >
                {paymentInfo.label}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-card-foreground font-semibold">Total Amount</span>
            <span className="text-primary text-lg font-bold">
              {formatCurrency(order.total_amount)}
            </span>
          </div>
        </div>

        {/* Footer with date and action - Figma style */}
        <div className="border-border flex items-center justify-between border-t pt-3">
          <div className="text-muted-foreground flex items-center gap-1 text-xs">
            <CalendarDays className="h-3 w-3" />
            {formatDate(order.created_at)}
          </div>

          <Button
            size="sm"
            onClick={handleViewOrder}
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-4 py-2 text-xs font-medium"
          >
            <Eye className="mr-1 h-3 w-3" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
