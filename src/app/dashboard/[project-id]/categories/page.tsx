import { Suspense } from 'react';
import { CategoriesPageContent } from './categories-page-content';
import { CategoriesPageSkeleton } from './loading';

interface CategoriesPageProps {
  params: Promise<{ 'project-id': string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CategoriesPage({ params, searchParams }: CategoriesPageProps) {
  const { 'project-id': projectId } = await params;
  const resolvedSearchParams = await searchParams;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Suspense fallback={<CategoriesPageSkeleton />}>
        <CategoriesPageContent projectId={projectId} searchParams={resolvedSearchParams} />
      </Suspense>
    </div>
  );
}
