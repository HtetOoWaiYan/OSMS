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
    <div className="space-y-6">
      {/* Success Header */}
      <Card>
        <CardContent className="pt-6 text-center">
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <h1 className="mb-2 text-2xl font-bold">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-4">Your order has been successfully placed.</p>
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="font-medium text-green-800">Order #{order.order_number}</p>
            <p className="text-sm text-green-600">Total: {formatPrice(order.total_amount)}</p>
          </div>
        </CardContent>
      </Card>

      {/* COD Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Cash on Delivery (COD)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="mb-2 font-semibold text-blue-900">Payment Instructions</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Pay the total amount when your order arrives</li>
              <li>• Have exact change ready if possible</li>
              <li>• Payment accepted in Myanmar Kyat (MMK) only</li>
              <li>• Please check your order before payment</li>
            </ul>
          </div>

          <div className="bg-muted flex items-center gap-3 rounded-lg p-3">
            <Clock className="text-muted-foreground h-5 w-5" />
            <div>
              <p className="font-medium">Estimated Delivery</p>
              <p className="text-muted-foreground text-sm">
                2-3 business days from order confirmation
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Delivery Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="font-medium">Delivery Address:</p>
            <div className="text-muted-foreground text-sm">
              <p>
                {firstName} {lastName}
              </p>
              <p>{addressLine1}</p>
              {addressLine2 && <p>{addressLine2}</p>}
              <p>{city}</p>
              {postalCode && <p>{postalCode}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Phone className="text-muted-foreground h-4 w-4" />
            <span className="text-sm">{phone}</span>
          </div>

          {order.delivery_notes && (
            <div>
              <p className="text-sm font-medium">Delivery Notes:</p>
              <p className="text-muted-foreground text-sm">{order.delivery_notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Important Notice */}
      <Card>
        <CardContent className="pt-6">
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <h3 className="mb-2 font-semibold text-yellow-900">Important Notice</h3>
            <ul className="space-y-1 text-sm text-yellow-800">
              <li>• Our delivery team will contact you before delivery</li>
              <li>• Please ensure someone is available to receive the order</li>
              <li>• You can track your order status in the Orders section</li>
              <li>• Contact us if you need to modify your order</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button onClick={handleViewOrder} className="w-full" size="lg">
          View Order Details
        </Button>

        <Button variant="outline" onClick={handleContinueShopping} className="w-full">
          Continue Shopping
        </Button>
      </div>
    </div>
  );
}
