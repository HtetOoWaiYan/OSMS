'use client';

import { Button } from '@/components/ui/button';
import { ShoppingCart, List, Search, X } from 'lucide-react';
import { useCartStore } from '@/lib/stores/cart-store';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MiniAppHeaderProps {
  projectId: string;
  projectName?: string;
  showSearch?: boolean;
  onSearchToggle?: () => void;
}

export function MiniAppHeader({ 
  projectId, 
  projectName = "Purple Shopping",
  showSearch = false,
  onSearchToggle 
}: MiniAppHeaderProps) {
  const { getTotalItems } = useCartStore();
  const pathname = usePathname();
  const totalItems = getTotalItems();

  const isCartPage = pathname?.includes('/cart');
  const isOrdersPage = pathname?.includes('/orders');

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto max-w-md px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo/Title */}
          <div className="flex items-center gap-2">
            <Link href={`/app/${projectId}`} className="flex items-center gap-2">
              <div className="text-lg">🛍️</div>
              <h1 className="font-semibold text-lg truncate max-w-[180px]">
                {projectName}
              </h1>
            </Link>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Search toggle */}
            {onSearchToggle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSearchToggle}
                className="h-9 w-9 p-0"
              >
                {showSearch ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            )}

            {/* Orders */}
            {!isOrdersPage && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-9 w-9 p-0"
              >
                <Link href={`/app/${projectId}/orders`}>
                  <List className="h-4 w-4" />
                </Link>
              </Button>
            )}

            {/* Cart */}
            {!isCartPage && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-9 w-9 p-0 relative"
              >
                <Link href={`/app/${projectId}/cart`}>
                  <ShoppingCart className="h-4 w-4" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems > 99 ? '99+' : totalItems}
                    </span>
                  )}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}