import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { getItemsAction, getCategoriesAction } from '@/lib/actions/items';
import { ItemsTable } from '@/components/items/items-table';

interface ItemsPageContentProps {
  projectId: string;
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function ItemsPageContent({ projectId, searchParams }: ItemsPageContentProps) {
  // Convert search params to URLSearchParams for the action
  const urlSearchParams = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach((v) => urlSearchParams.append(key, v));
      } else {
        urlSearchParams.set(key, value);
      }
    }
  });

  // Fetch items and categories
  const [itemsResult, categoriesResult] = await Promise.all([
    getItemsAction(projectId),
    getCategoriesAction(projectId),
  ]);

  const items = itemsResult.success ? itemsResult.data?.items || [] : [];
  const totalItems = itemsResult.success ? itemsResult.data?.total || 0 : 0;
  const categories = categoriesResult.success ? categoriesResult.data || [] : [];

  // Current filter values
  const currentSearch = (searchParams.search as string) || '';
  const currentCategory = (searchParams.categoryId as string) || 'all';
  const currentStatus = (searchParams.isActive as string) || 'all';
  const currentFeatured = (searchParams.isFeatured as string) || 'all';

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
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
              <Input
                placeholder="Search items..."
                className="pl-10"
                defaultValue={currentSearch}
                name="search"
                form="filters-form"
              />
            </div>

            {/* Category Filter */}
            <Select defaultValue={currentCategory} name="categoryId" form="filters-form">
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select defaultValue={currentStatus} name="isActive" form="filters-form">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {/* Featured Filter */}
            <Select defaultValue={currentFeatured} name="isFeatured" form="filters-form">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Items" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="true">Featured</SelectItem>
                <SelectItem value="false">Not Featured</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter Button */}
            <Button type="submit" form="filters-form" variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>

          {/* Hidden form for filters */}
          <form
            id="filters-form"
            action={`/dashboard/${projectId}/items`}
            method="GET"
            className="hidden"
          />
        </CardContent>
      </Card>

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
                {currentSearch ||
                currentCategory !== 'all' ||
                currentStatus !== 'all' ||
                currentFeatured !== 'all'
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
