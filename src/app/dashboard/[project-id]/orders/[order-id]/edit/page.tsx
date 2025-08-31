import { Suspense } from 'react';
import { EditOrderPageContent } from './edit-order-page-content';
import Loading from './loading';

interface EditOrderPageProps {
  params: Promise<{ 'project-id': string; 'order-id': string }>;
}

export default async function EditOrderPage({ params }: EditOrderPageProps) {
  const { 'project-id': projectId, 'order-id': orderId } = await params;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Suspense fallback={<Loading />}>
        <EditOrderPageContent projectId={projectId} orderId={orderId} />
      </Suspense>
    </div>
  );
}
