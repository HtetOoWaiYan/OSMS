import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ItemForm } from '@/components/items/item-form';
import { getCategoriesAction } from '@/lib/actions/items';
import { Suspense } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { Tables } from '@/lib/supabase/database.types';

type Category = Tables<'categories'>;

interface NewItemPageProps {
  params: Promise<{ 'project-id': string }>;
}

export default async function NewItemPage({ params }: NewItemPageProps) {
  const { 'project-id': projectId } = await params;

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
            <h1 className="text-2xl font-bold tracking-tight">Add New Item</h1>
            <p className="text-muted-foreground">Create a new product for your inventory</p>
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
                You can still create the item, but category selection will be limited. Try
                refreshing the page or contact support if the problem persists.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <div className="max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
            <CardDescription>
              Enter the basic information for your new item. All fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="flex items-center justify-center space-x-2 p-8">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading form...</span>
                </div>
              }
            >
              <ItemForm projectId={projectId} categories={categories} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
