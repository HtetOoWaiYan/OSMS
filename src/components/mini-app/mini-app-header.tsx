'use client';

import { Search, ShoppingCart, Package, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/hooks/use-cart-store';

interface MiniAppHeaderProps {
  projectId: string;
  showSearch?: boolean;
}

export function MiniAppHeader({ projectId, showSearch = true }: MiniAppHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const { items } = useCartStore();

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    } else {
      params.delete('q');
    }
    router.push(`/app/${projectId}?${params.toString()}`);
  };

  const navigateToHome = () => {
    router.push(`/app/${projectId}`);
  };

  const navigateToCart = () => {
    router.push(`/app/${projectId}/cart`);
  };

  const navigateToOrders = () => {
    router.push(`/app/${projectId}/orders`);
  };

  return (
    <header className="border-border bg-card sticky top-0 z-50 border-b">
      <div className="flex h-14 items-center gap-3 px-3">
        {/* Home Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={navigateToHome}
          className="h-9 w-9 flex-shrink-0"
        >
          <Home className="h-5 w-5" />
        </Button>

        {showSearch && (
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search products..."
                className="border-border bg-muted focus:bg-card h-9 rounded-full pr-4 pl-10 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        )}

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={navigateToOrders} className="h-9 w-9">
            <Package className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" onClick={navigateToCart} className="relative h-9 w-9">
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && (
              <span className="bg-destructive text-destructive-foreground absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium">
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
