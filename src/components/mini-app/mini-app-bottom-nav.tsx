'use client';

import { Home, Grid3X3, ShoppingCart, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter, usePathname } from 'next/navigation';
import { useCartStore } from '@/hooks/use-cart-store';

interface MiniAppBottomNavProps {
  projectId: string;
}

export function MiniAppBottomNav({ projectId }: MiniAppBottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { items } = useCartStore();

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  const navigation = [
    {
      name: 'Home',
      href: `/app/${projectId}`,
      icon: Home,
      current: pathname === `/app/${projectId}`,
    },
    {
      name: 'Categories',
      href: `/app/${projectId}/categories`,
      icon: Grid3X3,
      current: pathname.startsWith(`/app/${projectId}/categories`),
    },
    {
      name: 'Cart',
      href: `/app/${projectId}/cart`,
      icon: ShoppingCart,
      current: pathname === `/app/${projectId}/cart`,
      badge: cartItemCount > 0 ? cartItemCount : undefined,
    },
    {
      name: 'Orders',
      href: `/app/${projectId}/orders`,
      icon: Package,
      current: pathname === `/app/${projectId}/orders`,
    },
  ];

  return (
    <nav className="bg-background fixed right-0 bottom-0 left-0 z-50 border-t">
      <div className="container mx-auto max-w-md">
        <div className="flex items-center justify-around px-2 py-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.name}
                variant={item.current ? 'default' : 'ghost'}
                size="sm"
                className="relative h-auto flex-col gap-1 px-3 py-2"
                onClick={() => router.push(item.href)}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs">{item.name}</span>
                {item.badge && (
                  <span className="bg-destructive text-destructive-foreground absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-xs">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
