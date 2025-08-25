import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { getItemsAction, getCategoriesAction } from '@/lib/actions/items';
import { ItemsTable } from '@/components/items/items-table';
import { ItemFilters } from '@/lib/validations/items';
import { ItemsFilterForm } from './items-filter-form';

interface ItemsPageContentProps {
  projectId: string;
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function ItemsPageContent({ projectId, searchParams }: ItemsPageContentProps) {
  // Build filters from search params
  const filters: ItemFilters = {
    search: searchParams.search as string,
    categoryId:
      searchParams.categoryId === 'all'
        ? undefined
        : searchParams.categoryId === 'no-category'
          ? null
          : (searchParams.categoryId as string),
    isActive:
      !searchParams.isActive || searchParams.isActive === 'all'
        ? undefined
        : searchParams.isActive === 'true'
          ? true
          : false,
    isFeatured:
      !searchParams.isFeatured || searchParams.isFeatured === 'all'
        ? undefined
        : searchParams.isFeatured === 'true'
          ? true
          : false,
    sortBy:
      (searchParams.sortBy as 'name' | 'created_at' | 'stock_quantity' | 'price') || 'created_at',
    sortOrder: (searchParams.sortOrder as 'asc' | 'desc') || 'desc',
    page: parseInt(searchParams.page as string) || 1,
    limit: parseInt(searchParams.limit as string) || 20,
  };

  // Fetch items and categories
  const [itemsResult, categoriesResult] = await Promise.all([
    getItemsAction(projectId, filters),
    getCategoriesAction(projectId),
  ]);

  const items = itemsResult.success ? itemsResult.data?.items || [] : [];
  const totalItems = itemsResult.success ? itemsResult.data?.total || 0 : 0;
  const categories = categoriesResult.success ? categoriesResult.data || [] : [];

  // Current filter values for the form
  const currentFilters = {
    search: (searchParams.search as string) || '',
    categoryId: (searchParams.categoryId as string) || 'all',
    isActive: (searchParams.isActive as string) || 'all',
    isFeatured: (searchParams.isFeatured as string) || 'all',
    sortBy: (searchParams.sortBy as string) || 'created_at',
    sortOrder: (searchParams.sortOrder as string) || 'desc',
  };

  return (
    <>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Items</h1>
          <p className="text-muted-foreground">
            Manage your product inventory ({totalItems} items)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href={`/dashboard/${projectId}/items/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <ItemsFilterForm
        projectId={projectId}
        categories={categories}
        currentFilters={currentFilters}
      />

      {/* Items Table */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-muted-foreground text-center">
              <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <Plus className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-lg font-medium">No items found</h3>
              <p className="mb-4">
                {currentFilters.search ||
                currentFilters.categoryId !== 'all' ||
                currentFilters.isActive !== 'all' ||
                currentFilters.isFeatured !== 'all'
                  ? 'No items match your current filters. Try adjusting your search criteria.'
                  : 'Get started by creating your first product item.'}
              </p>
              <Button asChild>
                <Link href={`/dashboard/${projectId}/items/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Item
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Product Inventory</CardTitle>
                <CardDescription>{totalItems} items in your inventory</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ItemsTable items={items} projectId={projectId} />

            {/* Pagination would go here if needed */}
          </CardContent>
        </Card>
      )}
    </>
  );
}
