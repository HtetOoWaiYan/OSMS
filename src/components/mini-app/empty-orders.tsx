'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EmptyOrdersProps {
  filter: string;
}

export function EmptyOrders({ filter }: EmptyOrdersProps) {
  const router = useRouter();

  const getEmptyMessage = () => {
    switch (filter) {
      case 'pending':
        return {
          title: 'No Pending Orders',
          message: "You don't have any pending orders at the moment.",
        };
      case 'confirmed':
        return {
          title: 'No Confirmed Orders',
          message: "You don't have any confirmed orders at the moment.",
        };
      case 'paid':
        return {
          title: 'No Paid Orders',
          message: "You don't have any paid orders at the moment.",
        };
      case 'delivering':
        return {
          title: 'No Orders Being Delivered',
          message: "You don't have any orders currently being delivered.",
        };
      case 'delivered':
        return {
          title: 'No Delivered Orders',
          message: "You don't have any delivered orders yet.",
        };
      case 'cancelled':
        return {
          title: 'No Cancelled Orders',
          message: "You don't have any cancelled orders.",
        };
      default:
        return {
          title: 'No Orders Yet',
          message:
            "You haven't placed any orders yet. Start shopping to see your order history here!",
        };
    }
  };

  const handleStartShopping = () => {
    router.back(); // Go back to the shop/home page
  };

  const { title, message } = getEmptyMessage();
  const isAllFilter = filter === 'all' || !filter;

  return (
    <Card>
      <CardContent className="py-16 text-center">
        <div className="space-y-4">
          <div className="bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full">
            {isAllFilter ? (
              <ShoppingBag className="text-muted-foreground h-8 w-8" />
            ) : (
              <Package className="text-muted-foreground h-8 w-8" />
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-muted-foreground mx-auto max-w-sm text-sm">{message}</p>
          </div>

          {isAllFilter && (
            <Button onClick={handleStartShopping} className="mt-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Start Shopping
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
