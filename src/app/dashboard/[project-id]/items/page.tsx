import { Suspense } from 'react';
import { ItemsPageContent } from './items-page-content';
import { ItemsPageSkeleton } from './loading';

interface ItemsPageProps {
  params: Promise<{ 'project-id': string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ItemsPage({ params, searchParams }: ItemsPageProps) {
  const { 'project-id': projectId } = await params;
  const resolvedSearchParams = await searchParams;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Suspense fallback={<ItemsPageSkeleton />}>
        <ItemsPageContent projectId={projectId} searchParams={resolvedSearchParams} />
      </Suspense>
    </div>
  );
}
