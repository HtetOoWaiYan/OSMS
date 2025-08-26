import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {order.order_items.map((item) => {
            const itemData = getItemSnapshot(item.item_snapshot);
            return (
              <div key={item.id} className="flex items-center space-x-3">
                {itemData.image_url && (
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      src={itemData.image_url}
                      alt={itemData.name}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{itemData.name}</p>
                  <p className="text-xs text-gray-500">SKU: {itemData.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {item.quantity} × {formatCurrency(item.unit_price)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(item.quantity * item.unit_price)}
                  </p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Pricing Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          {order.shipping_cost && order.shipping_cost > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Fee</span>
              <span>{formatCurrency(order.shipping_cost)}</span>
            </div>
          )}

          {order.discount_amount && order.discount_amount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-{formatCurrency(order.discount_amount)}</span>
            </div>
          )}

          <Separator />

          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatCurrency(order.total_amount)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Payment Method</span>
            <Badge variant="outline" className="capitalize">
              {order.payment_method?.replace('_', ' ') || 'COD'}
            </Badge>
          </div>

          {order.payment_status && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Payment Status</span>
              <Badge
                variant={order.payment_status === 'paid' ? 'default' : 'secondary'}
                className="capitalize"
              >
                {order.payment_status}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {order.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-gray-700">{order.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
