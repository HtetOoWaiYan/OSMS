import { Suspense } from 'react';
import { MiniAppLayout } from '@/components/mini-app/mini-app-layout';
import { OrderHistory } from '@/components/mini-app/order-history';
import { OrdersLoading } from '@/components/mini-app/orders-loading';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <MiniAppLayout projectId={projectId} showBottomNav={false}>
      <div className="min-h-screen bg-gray-50">
        {/* Header - Figma style */}
        <div className="border-b border-gray-200 bg-white">
          <div className="px-4 py-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.history.back()}
                className="h-9 w-9 flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <h1 className="text-lg font-semibold text-gray-900">Orders</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Order History with Suspense */}
          <Suspense fallback={<OrdersLoading />}>
            <OrderHistory projectId={projectId} statusFilter={status} page={page} />
          </Suspense>
        </div>
      </div>
    </MiniAppLayout>
  );
}
