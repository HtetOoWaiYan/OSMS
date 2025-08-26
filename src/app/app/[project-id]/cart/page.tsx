'use client';

import { MiniAppLayout } from '@/components/mini-app/mini-app-layout';
import { CartItemsList } from '@/components/mini-app/cart-items-list';
import { CartSummary } from '@/components/mini-app/cart-summary';
import { EmptyCart } from '@/components/mini-app/empty-cart';
import { useCartStore } from '@/hooks/use-cart-store';
import { useEffect, useState, useCallback } from 'react';
import { validateCartStockAction } from '@/lib/actions/mini-app';
import { toast } from 'sonner';

interface CartPageProps {
  params: Promise<{ 'project-id': string }>;
}

export default function CartPage({ params }: CartPageProps) {
  const [projectId, setProjectId] = useState<string>('');
  const [isValidating, setIsValidating] = useState(false);
  const { items, updateQuantity } = useCartStore();

  useEffect(() => {
    params.then(({ 'project-id': id }) => setProjectId(id));
  }, [params]);

  const validateStock = useCallback(async () => {
    if (items.length === 0) return;

    setIsValidating(true);
    try {
      const result = await validateCartStockAction({
        items: items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
        })),
      });

      if (result.success && result.data) {
        const { valid, invalidItems } = result.data;

        if (!valid && invalidItems.length > 0) {
          // Update cart with valid quantities
          invalidItems.forEach((item) => {
            if (item.availableQuantity === 0) {
              // Remove out of stock items
              updateQuantity(item.id, 0);
              toast.error(`${item.name} is now out of stock and has been removed from your cart`);
            } else if (item.availableQuantity < item.requestedQuantity) {
              // Reduce quantity to available stock
              updateQuantity(item.id, item.availableQuantity);
              toast.warning(
                `${item.name} quantity reduced to ${item.availableQuantity} (available stock)`,
              );
            }
          });
        }
      }
    } catch (error) {
      console.error('Error validating stock:', error);
      toast.error('Failed to validate stock levels');
    } finally {
      setIsValidating(false);
    }
  }, [items, updateQuantity]);

  // Validate stock on page load
  useEffect(() => {
    if (items.length > 0 && projectId) {
      validateStock();
    }
  }, [projectId, items.length, validateStock]); // Include validateStock in dependencies

  if (!projectId) {
    return (
      <MiniAppLayout projectId="">
        <div className="container mx-auto max-w-md px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="bg-muted h-8 rounded"></div>
            <div className="bg-muted h-32 rounded"></div>
          </div>
        </div>
      </MiniAppLayout>
    );
  }

  if (items.length === 0) {
    return (
      <MiniAppLayout projectId={projectId}>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="border-b border-gray-200 bg-white px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900">My Cart</h1>
              <div className="rounded-full bg-gray-100 px-3 py-1">
                <span className="text-sm font-medium text-gray-500">0 items</span>
              </div>
            </div>
          </div>

          <EmptyCart projectId={projectId} />
        </div>
      </MiniAppLayout>
    );
  }

  return (
    <MiniAppLayout projectId={projectId}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">My Cart</h1>
            <div className="rounded-full bg-blue-100 px-3 py-1">
              <span className="text-sm font-medium text-blue-700">
                {items.length} item{items.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-4">
          {/* Stock validation warning */}
          {isValidating && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                <p className="text-sm font-medium text-blue-800">Checking stock availability...</p>
              </div>
            </div>
          )}

          {/* Cart Items */}
          <div className="space-y-3">
            <CartItemsList
              items={items}
              onValidateStock={validateStock}
              isValidating={isValidating}
            />
          </div>

          {/* Cart Summary */}
          <CartSummary projectId={projectId} onValidateStock={validateStock} />
        </div>
      </div>
    </MiniAppLayout>
  );
}
