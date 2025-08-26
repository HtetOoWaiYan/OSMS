import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { EditItemForm } from '@/components/items/edit-item-form';
import { getCategoriesAction } from '@/lib/actions/items';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { Tables } from '@/lib/supabase/database.types';

type Category = Tables<'categories'>;

interface EditItemPageProps {
  params: Promise<{
    'project-id': string;
    'item-id': string;
  }>;
}

export default async function EditItemPage({ params }: EditItemPageProps) {
  const { 'project-id': projectId, 'item-id': itemId } = await params;

  // Fetch categories for the form with comprehensive error handling
  let categories: Category[] = [];
  let categoriesError: string | null = null;

  try {
    const categoriesResult = await getCategoriesAction(projectId);
    if (categoriesResult.success) {
      categories = categoriesResult.data || [];
    } else {
      categoriesError = categoriesResult.error || 'Failed to load categories';
    }
  } catch (error) {
    console.error('Error loading categories:', error);
    categoriesError = 'An unexpected error occurred while loading categories';
  }

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

      {/* Categories Error Display */}
      {categoriesError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Unable to load categories</p>
              <p className="text-sm">{categoriesError}</p>
              <p className="text-muted-foreground text-sm">
                You can still edit the item, but category selection will be limited. Try refreshing
                the page or contact support if the problem persists.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Edit Form */}
      <div className="max-w-4xl">
        <Suspense
          fallback={
            <div className="flex items-center justify-center space-x-2 p-8">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading item data...</span>
            </div>
          }
        >
          <EditItemForm projectId={projectId} itemId={itemId} categories={categories} />
        </Suspense>
      </div>
    </div>
  );
}
