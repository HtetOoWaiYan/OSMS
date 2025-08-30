import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, User, Calendar } from 'lucide-react';
import type { Tables } from '@/lib/supabase/database.types';

interface CustomerInfoProps {
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

export function CustomerInfo({ order }: CustomerInfoProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Intl.DateTimeFormat('en-MM', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const getCustomerName = () => {
    if (order.customers?.first_name && order.customers?.last_name) {
      return `${order.customers.first_name} ${order.customers.last_name}`;
    }
    if (order.customers?.first_name) {
      return order.customers.first_name;
    }
    if (order.customers?.telegram_username) {
      return `@${order.customers.telegram_username}`;
    }
    return 'Telegram User';
  };

  // Helper function to safely access shipping address data
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

  return (
    <div className="space-y-4">
      {/* Customer Details */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
            <User className="h-5 w-5 text-blue-600" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 rounded-lg bg-gray-50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Name</span>
              <span className="font-medium text-gray-900">{getCustomerName()}</span>
            </div>

            {/* Get primary phone from customer or shipping address */}
            {(order.customers?.phone ||
              (typeof shippingData.phone === 'string' ? shippingData.phone : undefined)) && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  Phone
                </span>
                <span className="font-medium text-gray-900">
                  {String(order.customers?.phone || shippingData.phone || '')}
                </span>
              </div>
            )}

            {order.customers?.telegram_username && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Telegram</span>
                <span className="font-medium text-gray-900">
                  @{order.customers.telegram_username}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Information */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
            <MapPin className="h-5 w-5 text-green-600" />
            Delivery Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 rounded-lg border border-green-200 bg-green-50 p-3">
            {/* Extract delivery address from shipping_address JSON */}
            {shippingData && Object.keys(shippingData).length > 0 && (
              <div>
                <span className="text-sm font-medium text-green-700">Delivery Address</span>
                <p className="mt-1 text-sm text-green-800">
                  {typeof shippingData.address === 'string'
                    ? shippingData.address
                    : 'Address not available'}
                </p>
              </div>
            )}

            {order.delivery_city && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700">City</span>
                <Badge variant="outline" className="border-green-300 text-green-700">
                  {order.delivery_city}
                </Badge>
              </div>
            )}

            {order.delivery_notes && (
              <div>
                <span className="text-sm font-medium text-green-700">Special Instructions</span>
                <p className="mt-1 text-sm text-green-800">{order.delivery_notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order Timeline */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
            <Calendar className="h-5 w-5 text-purple-600" />
            Order Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 rounded-lg border border-purple-200 bg-purple-50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-purple-700">Order Placed</span>
              <span className="text-sm font-medium text-purple-800">
                {formatDate(order.created_at)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-purple-700">Order ID</span>
              <Badge
                variant="outline"
                className="border-purple-300 font-mono text-xs text-purple-700"
              >
                {order.id.slice(-8).toUpperCase()}
              </Badge>
            </div>

            {order.payment_reference && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-purple-700">Payment Reference</span>
                <Badge
                  variant="outline"
                  className="border-purple-300 font-mono text-xs text-purple-700"
                >
                  {order.payment_reference}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
