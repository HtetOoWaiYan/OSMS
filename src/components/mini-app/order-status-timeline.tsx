'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, Truck, Package } from 'lucide-react';

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
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleString('en-MM', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPaymentStatusInfo = (status: string) => {
    const variants: Record<
      string,
      { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; color: string }
    > = {
      pending: { variant: 'secondary', label: 'Awaiting Payment', color: 'text-chart-3' },
      paid: { variant: 'default', label: 'Payment Confirmed', color: 'text-chart-1' },
      failed: { variant: 'destructive', label: 'Payment Failed', color: 'text-destructive' },
    };
    return (
      variants[status] || { variant: 'secondary', label: status, color: 'text-muted-foreground' }
    );
  };

  const getOrderStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; description: string; color: string }> = {
      pending: {
        label: 'Order Placed',
        description: 'Your order is being processed',
        color: 'text-primary',
      },
      confirmed: {
        label: 'Order Confirmed',
        description: 'Your order has been confirmed and is being prepared',
        color: 'text-chart-1',
      },
      delivering: {
        label: 'Out for Delivery',
        description: 'Your order is on its way',
        color: 'text-chart-3',
      },
      delivered: {
        label: 'Delivered',
        description: 'Order successfully delivered',
        color: 'text-chart-1',
      },
      cancelled: {
        label: 'Order Cancelled',
        description: 'This order has been cancelled',
        color: 'text-destructive',
      },
    };
    return (
      statusMap[status] || {
        label: status,
        description: '',
        color: 'text-muted-foreground',
      }
    );
  };

  const paymentInfo = getPaymentStatusInfo(paymentStatus);
  const orderInfo = getOrderStatusInfo(currentStatus);

  // Define simplified order steps for invoice display
  const orderSteps = [
    {
      key: 'pending',
      label: 'Order Placed',
      icon: Clock,
      timestamp: timestamps.created_at,
    },
    {
      key: 'confirmed',
      label: 'Confirmed',
      icon: CheckCircle,
      timestamp: timestamps.confirmed_at,
    },
    {
      key: 'delivering',
      label: 'Delivery',
      icon: Truck,
      timestamp: null,
    },
    {
      key: 'delivered',
      label: 'Completed',
      icon: Package,
      timestamp: timestamps.delivered_at,
    },
  ];

  const getCurrentStepIndex = () => {
    const statusOrder = ['pending', 'confirmed', 'delivering', 'delivered'];
    return statusOrder.indexOf(currentStatus);
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        {/* Current Status Display - Figma style */}
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-card-foreground text-lg font-semibold">Order Status</h3>
            <Badge variant={paymentInfo.variant} className="capitalize">
              {paymentInfo.label}
            </Badge>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <div className={`text-lg font-semibold ${orderInfo.color} mb-1`}>{orderInfo.label}</div>
            <p className="text-muted-foreground mb-3 text-sm">{orderInfo.description}</p>
            {timestamps.created_at && (
              <p className="text-muted-foreground text-xs">
                Ordered on {formatDate(timestamps.created_at)}
              </p>
            )}
          </div>
        </div>

        {/* Simplified Progress Steps - Figma style */}
        {currentStatus !== 'cancelled' && (
          <div>
            <h4 className="text-muted-foreground mb-4 text-sm font-medium">Progress</h4>
            <div className="relative flex items-center justify-between">
              {/* Progress line background */}
              <div className="bg-border absolute top-4 right-4 left-4 h-0.5"></div>
              {/* Active progress line */}
              <div
                className="bg-chart-1 absolute top-4 left-4 h-0.5 transition-all duration-300"
                style={{
                  width: `${Math.max(0, (currentStepIndex / (orderSteps.length - 1)) * 100)}%`,
                }}
              ></div>

              {orderSteps.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const StepIcon = step.icon;

                return (
                  <div key={step.key} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`mb-2 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                        isCompleted
                          ? 'border-chart-1 bg-chart-1 text-white'
                          : 'border-border bg-card text-muted-foreground'
                      }`}
                    >
                      <StepIcon className="h-4 w-4" />
                    </div>
                    <p
                      className={`max-w-[50px] text-center text-xs ${
                        isCompleted ? 'text-chart-1 font-medium' : 'text-muted-foreground'
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Delivery Estimate - Figma style */}
        {currentStatus !== 'cancelled' && currentStatus !== 'delivered' && (
          <div className="border-primary/20 bg-primary/5 mt-6 rounded-lg border p-4">
            <div className="mb-1 flex items-center gap-2">
              <Truck className="text-primary h-4 w-4" />
              <span className="text-primary text-sm font-medium">Estimated Delivery</span>
            </div>
            <p className="text-primary/80 text-sm">
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
