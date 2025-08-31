import { Suspense } from 'react';
import { OrdersPageContent } from './orders-page-content';
import Loading from './loading';

interface OrdersPageProps {
  params: Promise<{ 'project-id': string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function OrdersPage({ params, searchParams }: OrdersPageProps) {
  const { 'project-id': projectId } = await params;
  const resolvedSearchParams = await searchParams;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Suspense fallback={<Loading />}>
        <OrdersPageContent projectId={projectId} searchParams={resolvedSearchParams} />
      </Suspense>
    </div>
  );
}
