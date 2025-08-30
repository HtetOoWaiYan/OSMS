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
          <CardTitle className="text-card-foreground flex items-center gap-2 text-lg">
            <User className="text-primary h-5 w-5" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted space-y-3 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Name</span>
              <span className="text-card-foreground font-medium">{getCustomerName()}</span>
            </div>

            {/* Get primary phone from customer or shipping address */}
            {(order.customers?.phone ||
              (typeof shippingData.phone === 'string' ? shippingData.phone : undefined)) && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1 text-sm">
                  <Phone className="h-4 w-4" />
                  Phone
                </span>
                <span className="text-card-foreground font-medium">
                  {String(order.customers?.phone || shippingData.phone || '')}
                </span>
              </div>
            )}

            {order.customers?.telegram_username && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Telegram</span>
                <span className="text-card-foreground font-medium">
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
          <CardTitle className="text-card-foreground flex items-center gap-2 text-lg">
            <MapPin className="text-chart-1 h-5 w-5" />
            Delivery Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-chart-1/20 bg-chart-1/5 space-y-3 rounded-lg border p-3">
            {/* Extract delivery address from shipping_address JSON */}
            {shippingData && Object.keys(shippingData).length > 0 && (
              <div>
                <span className="text-chart-1 text-sm font-medium">Delivery Address</span>
                <p className="text-chart-1/80 mt-1 text-sm">
                  {typeof shippingData.address === 'string'
                    ? shippingData.address
                    : 'Address not available'}
                </p>
              </div>
            )}

            {order.delivery_city && (
              <div className="flex items-center justify-between">
                <span className="text-chart-1 text-sm">City</span>
                <Badge variant="outline" className="border-chart-1/30 text-chart-1">
                  {order.delivery_city}
                </Badge>
              </div>
            )}

            {order.delivery_notes && (
              <div>
                <span className="text-chart-1 text-sm font-medium">Special Instructions</span>
                <p className="text-chart-1/80 mt-1 text-sm">{order.delivery_notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order Timeline */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-card-foreground flex items-center gap-2 text-lg">
            <Calendar className="text-chart-2 h-5 w-5" />
            Order Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-chart-2/20 bg-chart-2/5 space-y-3 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <span className="text-chart-2 text-sm">Order Placed</span>
              <span className="text-chart-2/80 text-sm font-medium">
                {formatDate(order.created_at)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-chart-2 text-sm">Order ID</span>
              <Badge variant="outline" className="border-chart-2/30 text-chart-2 font-mono text-xs">
                {order.id.slice(-8).toUpperCase()}
              </Badge>
            </div>

            {order.payment_reference && (
              <div className="flex items-center justify-between">
                <span className="text-chart-2 text-sm">Payment Reference</span>
                <Badge
                  variant="outline"
                  className="border-chart-2/30 text-chart-2 font-mono text-xs"
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
