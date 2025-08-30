'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Package, Clock, Phone, MapPin } from 'lucide-react';
import type { Tables } from '@/lib/supabase/database.types';

interface CODConfirmationProps {
  order: Tables<'orders'> & {
    customers?: {
      id: string;
      first_name: string | null;
      last_name: string | null;
      phone: string | null;
      telegram_username: string | null;
      telegram_user_id: number | null;
    } | null;
  };
}

export function CODConfirmation({ order }: CODConfirmationProps) {
  const router = useRouter();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-MM', {
      style: 'currency',
      currency: 'MMK',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Helper function to safely extract shipping address data
  const getShippingData = () => {
    if (
      order.shipping_address &&
      typeof order.shipping_address === 'object' &&
      order.shipping_address !== null
    ) {
      return order.shipping_address as Record<string, unknown>;
    }
    return {};
  };

  const shippingData = getShippingData();
  const firstName =
    typeof shippingData.firstName === 'string' ? shippingData.firstName : 'Customer';
  const lastName = typeof shippingData.lastName === 'string' ? shippingData.lastName : '';
  const phone = typeof shippingData.phone === 'string' ? shippingData.phone : 'N/A';
  const address =
    typeof shippingData.address === 'object' && shippingData.address !== null
      ? (shippingData.address as Record<string, unknown>)
      : {};
  const addressLine1 =
    typeof address.addressLine1 === 'string' ? address.addressLine1 : 'Address not available';
  const addressLine2 = typeof address.addressLine2 === 'string' ? address.addressLine2 : undefined;
  const city = typeof address.city === 'string' ? address.city : '';
  const postalCode = typeof address.postalCode === 'string' ? address.postalCode : undefined;

  const handleViewOrder = () => {
    router.push(`/app/${order.project_id}/invoice/${order.id}`);
  };

  const handleContinueShopping = () => {
    router.push(`/app/${order.project_id}`);
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="border-border bg-card border-b px-4 py-4">
        <div className="text-center">
          <CheckCircle2 className="text-chart-1 mx-auto mb-3 h-16 w-16" />
          <h1 className="text-card-foreground mb-2 text-2xl font-bold">Order Confirmed!</h1>
          <p className="text-muted-foreground">Your order has been successfully placed.</p>
        </div>
      </div>

      <div className="space-y-4 p-4">
        {/* Order Summary Card */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="rounded-xl border border-chart-1/20 bg-chart-1/5 p-4">
              <p className="text-chart-1 mb-1 text-lg font-bold">Order #{order.order_number}</p>
              <p className="text-chart-1 text-2xl font-bold">{formatPrice(order.total_amount)}</p>
            </div>
          </CardContent>
        </Card>

        {/* COD Information */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-card-foreground flex items-center gap-2 text-lg">
              <Package className="text-primary h-5 w-5" />
              Cash on Delivery (COD)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-primary/20 bg-primary/5 rounded-xl border p-4">
              <h3 className="text-primary mb-3 text-base font-semibold">Payment Instructions</h3>
              <ul className="text-primary/80 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  Pay the total amount when your order arrives
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  Have exact change ready if possible
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  Payment accepted in Myanmar Kyat (MMK) only
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  Please check your order before payment
                </li>
              </ul>
            </div>

            <div className="bg-muted flex items-center gap-3 rounded-xl border p-4">
              <Clock className="text-muted-foreground h-6 w-6 flex-shrink-0" />
              <div>
                <p className="text-card-foreground font-semibold">Estimated Delivery</p>
                <p className="text-muted-foreground text-sm">
                  2-3 business days from order confirmation
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Information */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-card-foreground flex items-center gap-2 text-lg">
              <MapPin className="text-chart-1 h-5 w-5" />
              Delivery Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted rounded-xl border p-4">
              <p className="text-card-foreground mb-2 font-semibold">Delivery Address:</p>
              <div className="text-muted-foreground space-y-1 text-sm">
                <p className="font-medium">
                  {firstName} {lastName}
                </p>
                <p>{addressLine1}</p>
                {addressLine2 && <p>{addressLine2}</p>}
                <p>{city}</p>
                {postalCode && <p>{postalCode}</p>}
              </div>

              <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">{phone}</span>
              </div>
            </div>

            {order.delivery_notes && (
              <div className="rounded-xl border border-chart-3/20 bg-chart-3/5 p-4">
                <p className="mb-1 text-sm font-semibold text-chart-3">Delivery Notes:</p>
                <p className="text-sm text-chart-3">{order.delivery_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Important Notice */}
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="rounded-xl border border-chart-3/20 bg-chart-3/5 p-4">
              <h3 className="mb-3 text-base font-semibold text-chart-3">Important Notice</h3>
              <ul className="space-y-2 text-sm text-chart-3">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-chart-3">•</span>
                  Our delivery team will contact you before delivery
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-chart-3">•</span>
                  Please ensure someone is available to receive the order
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-chart-3">•</span>
                  You can track your order status in the Orders section
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-chart-3">•</span>
                  Contact us if you need to modify your order
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Button
            onClick={handleViewOrder}
            className="h-12 w-full bg-primary font-semibold shadow-sm hover:bg-primary/90"
            size="lg"
          >
            View Order Details
          </Button>

          <Button
            variant="outline"
            onClick={handleContinueShopping}
            className="h-10 w-full border-border font-medium text-muted-foreground hover:bg-muted"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}
