import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag } from 'lucide-react';
import { ImagePlaceholder } from './image-placeholder';
import type { Tables } from '@/lib/supabase/database.types';

interface InvoiceDetailsProps {
  order: Tables<'orders'> & {
    order_items: Array<{
      id: string;
      quantity: number;
      unit_price: number;
      total_price: number;
      item_snapshot: unknown; // Json from database
    }>;
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

export function InvoiceDetails({ order }: InvoiceDetailsProps) {
  const subtotal = order.order_items.reduce(
    (sum: number, item) => sum + item.quantity * item.unit_price,
    0,
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MM', {
      style: 'currency',
      currency: 'MMK',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Helper function to safely extract item data from snapshot
  const getItemSnapshot = (snapshot: unknown) => {
    if (snapshot && typeof snapshot === 'object' && snapshot !== null) {
      const item = snapshot as Record<string, unknown>;
      return {
        name: typeof item.name === 'string' ? item.name : 'Unknown Item',
        sku: typeof item.sku === 'string' ? item.sku : 'N/A',
        image_url: typeof item.image_url === 'string' ? item.image_url : undefined,
      };
    }
    return {
      name: 'Unknown Item',
      sku: 'N/A',
      image_url: undefined,
    };
  };

  return (
    <div className="space-y-4">
      {/* Order Items */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
            <ShoppingBag className="h-5 w-5 text-purple-600" />
            Order Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {order.order_items.map((item) => {
            const itemData = getItemSnapshot(item.item_snapshot);
            return (
              <div key={item.id} className="flex items-center gap-4 rounded-lg bg-gray-50 p-3">
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-white">
                  <ImagePlaceholder
                    src={itemData.image_url || ''}
                    alt={itemData.name}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-900">{itemData.name}</p>
                  <p className="text-xs text-gray-500">SKU: {itemData.sku}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(item.quantity * item.unit_price)}
                  </p>
                  <p className="text-xs text-gray-500">{formatCurrency(item.unit_price)} each</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Pricing Breakdown */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pricing breakdown */}
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>

            {order.shipping_cost && order.shipping_cost > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-medium">{formatCurrency(order.shipping_cost)}</span>
              </div>
            )}

            {order.discount_amount && order.discount_amount > 0 && (
              <div className="flex items-center justify-between text-green-600">
                <span>Discount</span>
                <span className="font-medium">-{formatCurrency(order.discount_amount)}</span>
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-purple-600">{formatCurrency(order.total_amount)}</span>
            </div>
          </div>

          <Separator />

          {/* Payment info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Payment Method</span>
              <Badge variant="outline" className="capitalize">
                {order.payment_method?.replace('_', ' ') || 'COD'}
              </Badge>
            </div>

            {order.payment_status && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Payment Status</span>
                <Badge
                  variant={order.payment_status === 'paid' ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {order.payment_status}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {order.notes && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Order Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm whitespace-pre-wrap text-amber-800">{order.notes}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
