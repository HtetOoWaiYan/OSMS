'use client';

import { Package, ShoppingCart, Users, Home, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { NavUser } from '@/components/nav-user';

interface MenuItem {
  title: string;
  icon: React.ComponentType;
  href: string;
  exactMatch?: boolean;
  adminOnly?: boolean;
}

const menuItems: MenuItem[] = [
  {
    title: 'Overview',
    icon: Home,
    href: '/dashboard',
    exactMatch: true,
  },
  {
    title: 'Items',
    icon: Package,
    href: '/dashboard/items',
  },
  {
    title: 'Orders',
    icon: ShoppingCart,
    href: '/dashboard/orders',
  },
  {
    title: 'Users',
    icon: Users,
    href: '/dashboard/users',
    adminOnly: true,
  },
];

interface AppSidebarProps {
  user: {
    email?: string;
    [key: string]: unknown;
  };
  isAdmin?: boolean;
}

export function AppSidebar({ user, isAdmin = false }: AppSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string, exactMatch = false) => {
    if (exactMatch) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter((item) => {
    if (item.adminOnly) {
      return isAdmin;
    }
    return true;
  });

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center justify-center py-4">
          <Image src="/logo.svg" alt="PurpleShop" width={180} height={32} className="h-8 w-auto" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(item.href, item.exactMatch)}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
