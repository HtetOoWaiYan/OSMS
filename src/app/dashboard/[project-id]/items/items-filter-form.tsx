'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';
import { useCallback, useRef, useEffect } from 'react';

interface ItemsFilterFormProps {
  projectId: string;
  categories: Array<{
    id: string;
    name: string;
    description?: string | null;
  }>;
  currentFilters: {
    search: string;
    categoryId: string;
    isActive: string;
    isFeatured: string;
    sortBy: string;
    sortOrder: string;
  };
}

export function ItemsFilterForm({ projectId, categories, currentFilters }: ItemsFilterFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateFilters = useCallback(
    (updates: Partial<typeof currentFilters>) => {
      const newFilters = { ...currentFilters, ...updates };

      // Build URL search params
      const params = new URLSearchParams();
      if (newFilters.search) params.set('search', newFilters.search);
      if (newFilters.categoryId !== 'all') params.set('categoryId', newFilters.categoryId);
      if (newFilters.isActive !== 'all') params.set('isActive', newFilters.isActive);
      if (newFilters.isFeatured !== 'all') params.set('isFeatured', newFilters.isFeatured);
      if (newFilters.sortBy !== 'created_at') params.set('sortBy', newFilters.sortBy);
      if (newFilters.sortOrder !== 'desc') params.set('sortOrder', newFilters.sortOrder);

      const query = params.toString();
      const url = `/dashboard/${projectId}/items${query ? `?${query}` : ''}`;

      startTransition(() => {
        router.push(url);
      });
    },
    [currentFilters, projectId, router, startTransition],
  );

  // Custom debounce function for search
  const debouncedSearch = useCallback(
    (value: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      debounceTimeoutRef.current = setTimeout(() => {
        updateFilters({ search: value });
      }, 300);
    },
    [updateFilters],
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const clearFilters = useCallback(() => {
    updateFilters({
      search: '',
      categoryId: 'all',
      isActive: 'all',
      isFeatured: 'all',
      sortBy: 'created_at',
      sortOrder: 'desc',
    });
  }, [updateFilters]);

  const hasActiveFilters =
    currentFilters.search ||
    currentFilters.categoryId !== 'all' ||
    currentFilters.isActive !== 'all' ||
    currentFilters.isFeatured !== 'all';

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          {/* Search Row */}
          <div className="flex flex-col gap-4 sm:flex-row">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
              <Input
                placeholder="Search items..."
                className="pl-10"
                defaultValue={currentFilters.search}
                onChange={(e) => debouncedSearch(e.target.value)}
                disabled={isPending}
              />
            </div>

            {/* Category Filter */}
            <Select
              value={currentFilters.categoryId}
              onValueChange={(value) => updateFilters({ categoryId: value })}
              disabled={isPending}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="no-category">No Category</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={currentFilters.isActive}
              onValueChange={(value) => updateFilters({ isActive: value })}
              disabled={isPending}
            >
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
            <Select
              value={currentFilters.isFeatured}
              onValueChange={(value) => updateFilters({ isFeatured: value })}
              disabled={isPending}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Items" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="true">Featured</SelectItem>
                <SelectItem value="false">Not Featured</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort and Actions Row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Sort Options */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <span className="text-muted-foreground text-sm">Sort by:</span>
              <Select
                value={currentFilters.sortBy}
                onValueChange={(value) => updateFilters({ sortBy: value })}
                disabled={isPending}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Created</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="stock_quantity">Stock</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={currentFilters.sortOrder}
                onValueChange={(value) => updateFilters({ sortOrder: value })}
                disabled={isPending}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest</SelectItem>
                  <SelectItem value="asc">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  disabled={isPending}
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              )}
              <Button type="button" variant="outline" disabled={isPending}>
                <Filter className="mr-2 h-4 w-4" />
                {isPending ? 'Filtering...' : 'Filters'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
