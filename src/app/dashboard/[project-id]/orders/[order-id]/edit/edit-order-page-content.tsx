import { notFound } from 'next/navigation';
import { getOrdersAction } from '@/lib/actions/orders';
import { EditOrderForm } from '@/components/orders/edit-order-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface EditOrderPageContentProps {
  projectId: string;
  orderId: string;
}

export async function EditOrderPageContent({ projectId, orderId }: EditOrderPageContentProps) {
  // Fetch orders to find the specific order
  const ordersResult = await getOrdersAction(projectId);
  const orders = ordersResult.success ? ordersResult.data || [] : [];
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    notFound();
  }

  return (
    <>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/dashboard/${projectId}/orders`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Order</h1>
          <p className="text-muted-foreground">
            Order #{order.order_number} - {order.customer.first_name} {order.customer.last_name}
          </p>
        </div>
      </div>

      {/* Edit Order Form */}
      <EditOrderForm order={order} projectId={projectId} />
    </>
  );
}
