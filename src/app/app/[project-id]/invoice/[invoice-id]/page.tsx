import { notFound } from 'next/navigation';
import { MiniAppLayout } from '@/components/mini-app/mini-app-layout';
import { InvoiceHeader } from '@/components/mini-app/invoice-header';
import { OrderStatusTimeline } from '@/components/mini-app/order-status-timeline';
import { InvoiceDetails } from '@/components/mini-app/invoice-details';
import { CustomerInfo } from '@/components/mini-app/customer-info';
import { getOrderDetailsAction } from '@/lib/actions/mini-app';

interface InvoicePageProps {
  params: Promise<{
    'project-id': string;
    'invoice-id': string;
  }>;
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { 'project-id': projectId, 'invoice-id': invoiceId } = await params;

  // Get order details
  const orderResult = await getOrderDetailsAction(invoiceId);

  if (!orderResult.success || !orderResult.data) {
    notFound();
  }

  const order = orderResult.data;

  // Verify order belongs to this project
  if (order.project_id !== projectId) {
    notFound();
  }

  return (
    <MiniAppLayout projectId={projectId} showBottomNav={false}>
      <div className="min-h-screen bg-gray-50">
        <div className="space-y-4">
          <InvoiceHeader orderNumber={order.order_number} projectId={projectId} />

          <div className="space-y-4 px-4">
            <OrderStatusTimeline
              currentStatus={order.status || 'pending'}
              paymentStatus={order.payment_status || 'pending'}
              timestamps={{
                created_at: order.created_at,
                confirmed_at: order.confirmed_at,
                paid_at: order.paid_at,
                delivered_at: order.delivered_at,
              }}
            />

            <InvoiceDetails order={order} />

            <CustomerInfo order={order} />
          </div>
        </div>
      </div>
    </MiniAppLayout>
  );
}
