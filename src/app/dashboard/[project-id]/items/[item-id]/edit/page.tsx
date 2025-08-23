import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { EditItemForm } from '@/components/items/edit-item-form';
import { getCategoriesAction } from '@/lib/actions/items';

interface EditItemPageProps {
  params: Promise<{
    'project-id': string;
    'item-id': string;
  }>;
}

export default async function EditItemPage({ params }: EditItemPageProps) {
  const { 'project-id': projectId, 'item-id': itemId } = await params;

  // Fetch categories for the form
  const categoriesResult = await getCategoriesAction(projectId);
  const categories = categoriesResult.success ? categoriesResult.data || [] : [];

  // For now, we'll need to get the item data - we need to add this to actions
  // This is a simplified approach for the current implementation

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/${projectId}/items`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Items
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Item</h1>
            <p className="text-muted-foreground">Update item information and settings</p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="max-w-4xl">
        <Suspense fallback={<div>Loading item data...</div>}>
          <EditItemForm projectId={projectId} itemId={itemId} categories={categories} />
        </Suspense>
      </div>
    </div>
  );
}
