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
import { Search, X } from 'lucide-react';
import { useCallback, useRef, useEffect } from 'react';

interface OrdersFilterFormProps {
  projectId: string;
  currentFilters: {
    search: string;
    status: string;
    payment_status: string;
    payment_method: string;
    sortBy: string;
    sortOrder: string;
  };
}

export function OrdersFilterForm({ projectId, currentFilters }: OrdersFilterFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateFilters = useCallback(
    (updates: Partial<typeof currentFilters>) => {
      const newFilters = { ...currentFilters, ...updates };

      // Build URL search params
      const params = new URLSearchParams();
      if (newFilters.search) params.set('search', newFilters.search);
      if (newFilters.status !== 'all') params.set('status', newFilters.status);
      if (newFilters.payment_status !== 'all')
        params.set('payment_status', newFilters.payment_status);
      if (newFilters.payment_method !== 'all')
        params.set('payment_method', newFilters.payment_method);
      if (newFilters.sortBy !== 'created_at') params.set('sortBy', newFilters.sortBy);
      if (newFilters.sortOrder !== 'desc') params.set('sortOrder', newFilters.sortOrder);

      const query = params.toString();
      const url = `/dashboard/${projectId}/orders${query ? `?${query}` : ''}`;

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
      status: 'all',
      payment_status: 'all',
      payment_method: 'all',
      sortBy: 'created_at',
      sortOrder: 'desc',
    });
  }, [updateFilters]);

  const hasActiveFilters =
    currentFilters.search ||
    currentFilters.status !== 'all' ||
    currentFilters.payment_status !== 'all' ||
    currentFilters.payment_method !== 'all';

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search and Filters */}
          <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search orders, customers..."
                defaultValue={currentFilters.search}
                onChange={(e) => debouncedSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={currentFilters.status}
              onValueChange={(value) => updateFilters({ status: value })}
            >
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="delivering">Delivering</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Payment Status Filter */}
            <Select
              value={currentFilters.payment_status}
              onValueChange={(value) => updateFilters({ payment_status: value })}
            >
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>

            {/* Payment Method Filter */}
            <Select
              value={currentFilters.payment_method}
              onValueChange={(value) => updateFilters({ payment_method: value })}
            >
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="cod">Cash on Delivery</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="kbz_pay">KBZ Pay</SelectItem>
                <SelectItem value="aya_pay">AYA Pay</SelectItem>
                <SelectItem value="cb_pay">CB Pay</SelectItem>
                <SelectItem value="mobile_banking">Mobile Banking</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort and Clear */}
          <div className="flex items-center gap-2">
            {/* Sort */}
            <div className="flex items-center gap-2">
              <Select
                value={currentFilters.sortBy}
                onValueChange={(value) => updateFilters({ sortBy: value })}
              >
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Date Created</SelectItem>
                  <SelectItem value="order_number">Order Number</SelectItem>
                  <SelectItem value="total_amount">Total Amount</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={currentFilters.sortOrder}
                onValueChange={(value) => updateFilters({ sortOrder: value })}
              >
                <SelectTrigger className="w-full sm:w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Desc</SelectItem>
                  <SelectItem value="asc">Asc</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters} disabled={isPending}>
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
