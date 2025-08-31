import { Card, CardContent } from '@/components/ui/card';
import { Package } from 'lucide-react';
import { getOrdersAction } from '@/lib/actions/orders';
import { OrdersTable } from '@/components/orders/orders-table';
import { OrdersFilterForm } from './orders-filter-form';

interface OrdersPageContentProps {
  projectId: string;
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function OrdersPageContent({ projectId, searchParams }: OrdersPageContentProps) {
  // Build filters from search params
  const filters = {
    search: searchParams.search as string,
    status:
      (searchParams.status as
        | 'pending'
        | 'confirmed'
        | 'delivering'
        | 'delivered'
        | 'paid'
        | 'done'
        | 'cancelled') || undefined,
    payment_status:
      (searchParams.payment_status as 'pending' | 'paid' | 'failed' | 'refunded') || undefined,
    payment_method:
      (searchParams.payment_method as
        | 'cod'
        | 'online'
        | 'kbz_pay'
        | 'aya_pay'
        | 'cb_pay'
        | 'mobile_banking') || undefined,
    sortBy:
      (searchParams.sortBy as 'created_at' | 'order_number' | 'total_amount' | 'status') ||
      'created_at',
    sortOrder: (searchParams.sortOrder as 'asc' | 'desc') || 'desc',
  };

  // Fetch orders with filters
  const ordersResult = await getOrdersAction(projectId, filters);
  const orders = ordersResult.success ? ordersResult.data || [] : [];

  // Current filter values for the form
  const currentFilters = {
    search: (searchParams.search as string) || '',
    status: (searchParams.status as string) || 'all',
    payment_status: (searchParams.payment_status as string) || 'all',
    payment_method: (searchParams.payment_method as string) || 'all',
    sortBy: (searchParams.sortBy as string) || 'created_at',
    sortOrder: (searchParams.sortOrder as string) || 'desc',
  };

  return (
    <>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Track and manage customer orders ({orders.length} orders)
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <OrdersFilterForm projectId={projectId} currentFilters={currentFilters} />

      {/* Orders Table */}
      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-muted-foreground text-center">
              <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <Package className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-lg font-medium">No orders found</h3>
              <p className="mb-4">Customer orders from your mini-app will appear here.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <OrdersTable orders={orders} projectId={projectId} />
      )}
    </>
  );
}
