import { notFound } from 'next/navigation';
import { MiniAppLayout } from '@/components/mini-app/mini-app-layout';
import { CODConfirmation } from '@/components/mini-app/cod-confirmation';
import { PaymentConfirmation } from '@/components/mini-app/payment-confirmation';
import { getOrderDetailsAction } from '@/lib/actions/mini-app';
import { getPaymentMethodsForMiniApp } from '@/lib/data/mini-app';

interface PaymentPageProps {
  params: Promise<{ 'project-id': string }>;
  searchParams: Promise<{ orderId?: string }>;
}

export default async function PaymentPage({ params, searchParams }: PaymentPageProps) {
  const { 'project-id': projectId } = await params;
  const { orderId } = await searchParams;

  if (!orderId) {
    notFound();
  }

  // Get order details
  const orderResult = await getOrderDetailsAction(orderId);

  if (!orderResult.success || !orderResult.data) {
    notFound();
  }

  const order = orderResult.data;

  // Verify order belongs to this project
  if (order.project_id !== projectId) {
    notFound();
  }

  // Get payment method configuration
  const paymentMethods = await getPaymentMethodsForMiniApp(projectId);

  // Determine payment flow based on payment method
  if (order.payment_method === 'cod') {
    return (
      <MiniAppLayout projectId={projectId} showBottomNav={false}>
        <div className="bg-background min-h-screen">
          <CODConfirmation order={order} />
        </div>
      </MiniAppLayout>
    );
  }

  // For digital payment methods (KBZ Pay, CB Pay, AYA Pay)
  const paymentMethodConfig = paymentMethods[order.payment_method] as
    | {
        enabled?: boolean;
        phone_number?: string;
        qr_code_url?: string;
      }
    | undefined;

  return (
    <MiniAppLayout projectId={projectId} showBottomNav={false}>
      <div className="bg-background min-h-screen">
        <PaymentConfirmation order={order} paymentMethodConfig={paymentMethodConfig} />
      </div>
    </MiniAppLayout>
  );
}
