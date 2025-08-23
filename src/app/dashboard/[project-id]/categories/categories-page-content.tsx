import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { getCategoriesAction } from '@/lib/actions/items';
import { CreateCategoryDialog } from '@/components/items/create-category-dialog';

interface CategoriesPageContentProps {
  projectId: string;
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function CategoriesPageContent({
  projectId,
  searchParams,
}: CategoriesPageContentProps) {
  // Fetch categories
  const categoriesResult = await getCategoriesAction(projectId);
  const categories = categoriesResult.success ? categoriesResult.data || [] : [];

  // Filter categories based on search
  const currentSearch = (searchParams.search as string) || '';
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(currentSearch.toLowerCase()) ||
      (category.description &&
        category.description.toLowerCase().includes(currentSearch.toLowerCase())),
  );

  return (
    <>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage product categories ({categories.length} total, {filteredCategories.length} shown)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <CreateCategoryDialog projectId={projectId} />
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
              <Input
                placeholder="Search categories..."
                className="pl-10"
                defaultValue={currentSearch}
                name="search"
                form="filters-form"
              />
            </div>

            {/* Filter Button */}
            <Button type="submit" form="filters-form" variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>

          {/* Hidden form for filters */}
          <form
            id="filters-form"
            action={`/dashboard/${projectId}/categories`}
            method="GET"
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Categories Table */}
      {filteredCategories.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-muted-foreground text-center">
              <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <Plus className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-lg font-medium">No categories found</h3>
              <p className="mb-4">
                {currentSearch
                  ? 'No categories match your search criteria. Try adjusting your search term.'
                  : 'Get started by creating your first product category to organize your items.'}
              </p>
              <CreateCategoryDialog projectId={projectId} />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Product Categories</CardTitle>
                <CardDescription>
                  {filteredCategories.length} categories in your project
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Items Count</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="font-medium">{category.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-muted-foreground max-w-md truncate text-sm">
                          {category.description || '—'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={category.is_active ? 'default' : 'secondary'}>
                          {category.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {/* This would need to be fetched from the items count */}— items
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-muted-foreground text-sm">
                          {category.created_at
                            ? new Date(category.created_at).toLocaleDateString()
                            : '—'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
