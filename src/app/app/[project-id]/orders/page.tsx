import { Suspense } from 'react';
import { MiniAppLayout } from '@/components/mini-app/mini-app-layout';
import { OrderHistory } from '@/components/mini-app/order-history';
import { OrdersLoading } from '@/components/mini-app/orders-loading';

interface OrdersPageProps {
  params: Promise<{ 'project-id': string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function OrdersPage({ params, searchParams }: OrdersPageProps) {
  const { 'project-id': projectId } = await params;
  const searchParamsResolved = await searchParams;

  // Extract filter parameters
  const status =
    typeof searchParamsResolved.status === 'string' ? searchParamsResolved.status : undefined;
  const page =
    typeof searchParamsResolved.page === 'string' ? parseInt(searchParamsResolved.page) : 1;

  return (
    <MiniAppLayout projectId={projectId}>
      <div className="container mx-auto max-w-md px-4 py-6">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="text-center">
            <h1 className="text-2xl font-bold">My Orders</h1>
            <p className="text-muted-foreground">Track and view your order history</p>
          </div>

          {/* Order History with Suspense */}
          <Suspense fallback={<OrdersLoading />}>
            <OrderHistory projectId={projectId} statusFilter={status} page={page} />
          </Suspense>
        </div>
      </div>
    </MiniAppLayout>
  );
}
