'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, CreditCard, Truck, Package, XCircle } from 'lucide-react';

interface OrderStatusTimelineProps {
  currentStatus: string;
  paymentStatus: string;
  timestamps: {
    created_at: string | null;
    confirmed_at?: string | null;
    paid_at?: string | null;
    delivered_at?: string | null;
  };
}

export function OrderStatusTimeline({
  currentStatus,
  paymentStatus,
  timestamps,
}: OrderStatusTimelineProps) {
  const getStatusInfo = (status: string) => {
    const statusMap: Record<
      string,
      { label: string; color: string; icon: React.ComponentType<{ className?: string }> }
    > = {
      pending: { label: 'Order Placed', color: 'bg-blue-500', icon: Clock },
      confirmed: { label: 'Confirmed', color: 'bg-green-500', icon: CheckCircle },
      paid: { label: 'Payment Confirmed', color: 'bg-emerald-500', icon: CreditCard },
      delivering: { label: 'Out for Delivery', color: 'bg-orange-500', icon: Truck },
      delivered: { label: 'Delivered', color: 'bg-green-600', icon: Package },
      cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: XCircle },
    };
    return statusMap[status] || { label: status, color: 'bg-gray-500', icon: Clock };
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<
      string,
      { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }
    > = {
      pending: { variant: 'secondary', label: 'Payment Pending' },
      paid: { variant: 'default', label: 'Paid' },
      failed: { variant: 'destructive', label: 'Payment Failed' },
    };
    return variants[status] || { variant: 'secondary', label: status };
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-MM', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusInfo = getStatusInfo(currentStatus);
  const StatusIcon = statusInfo.icon;
  const paymentBadge = getPaymentStatusBadge(paymentStatus);

  // Define order flow
  const orderFlow = [
    {
      key: 'pending',
      label: 'Order Placed',
      timestamp: timestamps.created_at,
      icon: Clock,
    },
    {
      key: 'confirmed',
      label: 'Order Confirmed',
      timestamp: timestamps.confirmed_at,
      icon: CheckCircle,
    },
    {
      key: 'paid',
      label: 'Payment Confirmed',
      timestamp: timestamps.paid_at,
      icon: CreditCard,
    },
    {
      key: 'delivering',
      label: 'Out for Delivery',
      timestamp: null, // Will be set when status changes
      icon: Truck,
    },
    {
      key: 'delivered',
      label: 'Delivered',
      timestamp: timestamps.delivered_at,
      icon: Package,
    },
  ];

  const getCurrentStepIndex = () => {
    const statusOrder = ['pending', 'confirmed', 'paid', 'delivering', 'delivered'];
    return statusOrder.indexOf(currentStatus);
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon className="h-5 w-5" />
            Order Status
          </div>
          <Badge variant={paymentBadge.variant}>{paymentBadge.label}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="bg-muted rounded-lg p-4 text-center">
          <div
            className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${statusInfo.color} mb-2 text-white`}
          >
            <StatusIcon className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold">{statusInfo.label}</h3>
          {currentStatus === 'cancelled' && (
            <p className="text-muted-foreground mt-1 text-sm">This order has been cancelled</p>
          )}
        </div>

        {/* Timeline */}
        {currentStatus !== 'cancelled' && (
          <div className="space-y-3">
            <h4 className="text-muted-foreground text-sm font-medium">Order Timeline</h4>
            <div className="space-y-3">
              {orderFlow.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const StepIcon = step.icon;

                return (
                  <div key={step.key} className="flex items-center gap-3">
                    {/* Icon */}
                    <div
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                        isCompleted ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <StepIcon className="h-4 w-4" />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-sm font-medium ${
                            isCompleted ? 'text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          {step.label}
                        </p>
                        {isCurrent && (
                          <Badge variant="outline" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      {step.timestamp && (
                        <p className="text-muted-foreground text-xs">
                          {formatDate(step.timestamp)}
                        </p>
                      )}
                    </div>

                    {/* Line connector */}
                    {index < orderFlow.length - 1 && (
                      <div
                        className={`absolute left-[1rem] mt-8 h-6 w-0.5 ${
                          index < currentStepIndex ? 'bg-green-500' : 'bg-muted'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Estimated delivery (for active orders) */}
        {currentStatus !== 'cancelled' && currentStatus !== 'delivered' && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="text-sm font-medium text-blue-900">Estimated Delivery</p>
            <p className="text-xs text-blue-700">
              {currentStatus === 'delivering'
                ? 'Your order is on the way and should arrive today'
                : '2-3 business days from order confirmation'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
