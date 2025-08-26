'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter, useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface ProductFiltersProps {
  categories: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
  projectId: string;
}

export function ProductFilters({ categories, projectId }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedCategory = searchParams.get('category');
  const selectedSort = searchParams.get('sort') || 'created_at';
  const selectedOrder = searchParams.get('order') || 'desc';
  const searchQuery = searchParams.get('q');

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`/app/${projectId}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push(`/app/${projectId}`);
  };

  const hasActiveFilters =
    selectedCategory || searchQuery || selectedSort !== 'created_at' || selectedOrder !== 'desc';

  return (
    <div className="space-y-4">
      {/* Active filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">Active filters:</span>

          {searchQuery && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: {searchQuery}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0"
                onClick={() => updateFilter('q', null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {selectedCategory && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Category: {categories.find((c) => c.id === selectedCategory)?.name}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0"
                onClick={() => updateFilter('category', null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {(selectedSort !== 'created_at' || selectedOrder !== 'desc') && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Sort: {getSortLabel(selectedSort, selectedOrder)}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0"
                onClick={() => {
                  updateFilter('sort', null);
                  updateFilter('order', null);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          <Button variant="outline" size="sm" onClick={clearAllFilters} className="text-xs">
            Clear all
          </Button>
        </div>
      )}

      {/* Filter controls */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Category filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <Select
            value={selectedCategory || 'all'}
            onValueChange={(value) => updateFilter('category', value === 'all' ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Sort by</label>
          <Select
            value={`${selectedSort}-${selectedOrder}`}
            onValueChange={(value) => {
              const [sort, order] = value.split('-');
              updateFilter('sort', sort);
              updateFilter('order', order);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at-desc">Newest first</SelectItem>
              <SelectItem value="created_at-asc">Oldest first</SelectItem>
              <SelectItem value="name-asc">Name A-Z</SelectItem>
              <SelectItem value="name-desc">Name Z-A</SelectItem>
              <SelectItem value="price-asc">Price low to high</SelectItem>
              <SelectItem value="price-desc">Price high to low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

function getSortLabel(sort: string, order: string): string {
  const sortLabels: Record<string, string> = {
    'created_at-desc': 'Newest first',
    'created_at-asc': 'Oldest first',
    'name-asc': 'Name A-Z',
    'name-desc': 'Name Z-A',
    'price-asc': 'Price low to high',
    'price-desc': 'Price high to low',
  };

  return sortLabels[`${sort}-${order}`] || 'Custom';
}
