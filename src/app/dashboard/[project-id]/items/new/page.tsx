import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ItemForm } from '@/components/items/item-form';
import { getCategoriesAction } from '@/lib/actions/items';
import { Suspense } from 'react';

interface NewItemPageProps {
  params: Promise<{ 'project-id': string }>;
}

export default async function NewItemPage({ params }: NewItemPageProps) {
  const { 'project-id': projectId } = await params;

  // Fetch categories for the form
  const categoriesResult = await getCategoriesAction(projectId);
  const categories = categoriesResult.success ? categoriesResult.data || [] : [];

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

      {/* Form */}
      <div className="max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
            <CardDescription>Enter the basic information for your new item</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading form...</div>}>
              <ItemForm projectId={projectId} categories={categories} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
