'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OrderCard } from '@/components/mini-app/order-card';
import { EmptyOrders } from '@/components/mini-app/empty-orders';
import { getUserOrdersAction } from '@/lib/actions/mini-app';
import { useTelegramUser } from '@/components/telegram-provider';
import { Loader2, Filter } from 'lucide-react';

interface OrderHistoryProps {
  projectId: string;
  statusFilter?: string;
  page: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string | null;
  payment_status: string | null;
  payment_method: string;
  total_amount: number;
  created_at: string | null;
  updated_at: string | null;
  order_items: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    item_snapshot: {
      name: string;
      image_url?: string;
    };
  }>;
}

export function OrderHistory({ projectId, statusFilter, page }: OrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(page);
  const [filter, setFilter] = useState(statusFilter || 'all');

  const { user: telegramUser, isLoading: userLoading, error: userError } = useTelegramUser();

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Debug: Log the current state
      console.log('Telegram user state:', {
        isLoading: userLoading,
        hasUser: !!telegramUser,
        userError,
        telegramUser: telegramUser ? { id: telegramUser.id, name: telegramUser.first_name } : null,
      });

      // Check if we have a valid Telegram user
      if (userLoading) {
        return; // Still loading user data
      }

      if (userError) {
        console.log('User error:', userError);
        // For development purposes, show a more helpful error
        if (userError.includes('not in Telegram') || userError.includes('initData')) {
          setError(
            'This page works best when accessed through Telegram. For testing, mock user data is needed.',
          );
        } else {
          setError(userError);
        }
        return;
      }

      if (!telegramUser) {
        // No Telegram user available
        console.log('No Telegram user found - this might be a validation issue');
        setError('Please access this page through Telegram to view your orders.');
        return;
      }

      const result = await getUserOrdersAction({
        projectId,
        telegramUserId: telegramUser.id,
        status: filter === 'all' ? undefined : filter,
        page: currentPage,
        limit: 10,
      });

      if (result.success && result.data) {
        // Transform the data to match our interface
        const transformedOrders = result.data.orders.map((order) => ({
          ...order,
          order_items: order.order_items
            .map((item) => ({
              ...item,
              item_snapshot:
                item.item_snapshot && typeof item.item_snapshot === 'object'
                  ? (item.item_snapshot as { name: string; image_url?: string })
                  : null,
            }))
            .filter((item) => item.item_snapshot !== null) as Array<{
            id: string;
            quantity: number;
            unit_price: number;
            item_snapshot: { name: string; image_url?: string };
          }>,
        }));
        setOrders(transformedOrders);
        setTotalPages(Math.ceil(result.data.total / 10));
      } else {
        setError(result.error || 'Failed to load orders');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId, filter, currentPage, userLoading, userError, telegramUser]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={loadOrders} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Section - Figma style */}
      <div className="bg-card rounded-lg border-0 p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Filter className="text-primary h-5 w-5" />
          <span className="text-card-foreground font-semibold">Filter Orders</span>
        </div>
        <Select value={filter} onValueChange={handleFilterChange}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="delivering">Delivering</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <EmptyOrders filter={filter} />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} projectId={projectId} />
          ))}
        </div>
      )}

      {/* Pagination - Figma style */}
      {totalPages > 1 && (
        <div className="bg-card rounded-lg border-0 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-10"
            >
              Previous
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">
                Page {currentPage} of {totalPages}
              </span>
            </div>

            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-10"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
