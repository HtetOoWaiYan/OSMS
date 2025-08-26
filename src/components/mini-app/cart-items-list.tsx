'use client';

import { CartItem } from '@/hooks/use-cart-store';
import { CartItemCard } from './cart-item-card';

interface CartItemsListProps {
  items: CartItem[];
  onValidateStock: () => void;
  isValidating: boolean;
}

export function CartItemsList({ items, onValidateStock, isValidating }: CartItemsListProps) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <CartItemCard
          key={item.id}
          item={item}
          onValidateStock={onValidateStock}
          disabled={isValidating}
        />
      ))}
    </div>
  );
}
