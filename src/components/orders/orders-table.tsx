'use client';

import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { User, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Tables } from '@/lib/supabase/database.types';

type Order = Tables<'orders'>;
type Customer = Tables<'customers'>;
type OrderItem = Tables<'order_items'>;
type Item = Tables<'items'>;

interface OrderWithCustomer extends Order {
  customer: Customer;
  order_items?: OrderItemWithItem[];
}

interface OrderItemWithItem extends Omit<OrderItem, 'item_snapshot'> {
  item?:
    | (Item & {
        item_images?: Array<{
          image_url: string;
          display_order: number | null;
          is_primary: boolean | null;
        }>;
      })
    | null;
  item_snapshot?: {
    name?: string;
    sku?: string;
    description?: string;
    image_url?: string;
  };
}

interface OrdersTableProps {
  orders: OrderWithCustomer[];
  projectId: string;
}

// Helper function to get status badge variant
function getStatusBadgeVariant(status: string | null) {
  switch (status) {
    case 'pending':
      return 'secondary';
    case 'confirmed':
      return 'default';
    case 'delivering':
      return 'default';
    case 'delivered':
      return 'default';
    case 'paid':
      return 'default';
    case 'done':
      return 'default';
    case 'cancelled':
      return 'destructive';
    default:
      return 'secondary';
  }
}

// Helper function to get payment status badge variant
function getPaymentStatusBadgeVariant(status: string | null) {
  switch (status) {
    case 'pending':
      return 'secondary';
    case 'paid':
      return 'default';
    case 'failed':
      return 'destructive';
    case 'refunded':
      return 'outline';
    default:
      return 'secondary';
  }
}

// Helper function to format currency
function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

// Helper function to format date
function formatDate(dateString: string | null) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function OrdersTable({ orders, projectId }: OrdersTableProps) {
  const router = useRouter();

  const handleRowClick = (orderId: string) => {
    router.push(`/dashboard/${projectId}/orders/${orderId}/edit`);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order.id}
              className="hover:bg-muted/50 cursor-pointer"
              onClick={() => handleRowClick(order.id)}
            >
              <TableCell>
                <div className="flex items-center space-x-3">
                  <div className="bg-muted flex h-12 w-12 items-center justify-center overflow-hidden rounded-md">
                    <Package className="text-muted-foreground h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-medium">{order.order_number}</div>
                    <div className="text-muted-foreground text-sm">
                      {order.payment_method || 'cod'}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {order.order_items && order.order_items.length > 0 ? (
                    order.order_items.slice(0, 2).map((orderItem) => (
                      <div key={orderItem.id} className="text-sm">
                        <span className="font-medium">{orderItem.quantity}x</span>{' '}
                        {orderItem.item?.name || orderItem.item_snapshot?.name || 'Unknown Item'}
                      </div>
                    ))
                  ) : (
                    <div className="text-muted-foreground text-sm">No items</div>
                  )}
                  {order.order_items && order.order_items.length > 2 && (
                    <div className="text-muted-foreground text-xs">
                      +{order.order_items.length - 2} more items
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <div className="bg-muted flex h-8 w-8 items-center justify-center overflow-hidden rounded-full">
                    <User className="text-muted-foreground h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {order.customer.first_name} {order.customer.last_name}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {order.customer.phone || 'N/A'}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(order.status)}>
                  {order.status || 'pending'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getPaymentStatusBadgeVariant(order.payment_status)}>
                  {order.payment_status || 'pending'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="font-medium">{formatCurrency(order.total_amount)}</div>
                {(order.discount_amount || 0) > 0 && (
                  <div className="text-muted-foreground text-sm">
                    -{formatCurrency(order.discount_amount || 0)} discount
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="text-sm">{formatDate(order.created_at)}</div>
                {order.updated_at !== order.created_at && (
                  <div className="text-muted-foreground text-xs">
                    Updated {formatDate(order.updated_at)}
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
