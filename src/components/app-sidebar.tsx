'use client';

import { Package, ShoppingCart, Users, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
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

interface AppSidebarProps {
  user: {
    email?: string;
    [key: string]: unknown;
  };
  isAdmin?: boolean;
  project?: {
    id: string;
    name: string;
    description?: string | null;
  };
  projectId: string;
}

export function AppSidebar({ user, isAdmin = false, project, projectId }: AppSidebarProps) {
  const pathname = usePathname();

  // Create menu items with dynamic project-based URLs
  const getMenuItems = (): MenuItem[] => {
    const basePrefix = `/dashboard/${projectId}`;

    return [
      {
        title: 'Overview',
        icon: Home,
        href: basePrefix,
        exactMatch: true,
      },
      {
        title: 'Items',
        icon: Package,
        href: `${basePrefix}/items`,
      },
      {
        title: 'Orders',
        icon: ShoppingCart,
        href: `${basePrefix}/orders`,
      },
      {
        title: 'Users',
        icon: Users,
        href: `${basePrefix}/users`,
        adminOnly: true,
      },
    ];
  };

  const menuItems = getMenuItems();

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
        <div className="flex flex-col items-center space-y-3 pt-4 pb-0">
          <Image src="/logo.svg" alt="PurpleShop" width={180} height={32} className="h-8 w-auto" />
          {project && (
            <div className="flex items-center gap-1 self-start text-center">
              <div className="text-foreground text-sm font-medium">{project.name}</div>
              <div className="text-muted-foreground text-xs">
                <Link href="/dashboard" className="hover:text-foreground transition-colors">
                  ← Switch Project
                </Link>
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
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
        <NavUser user={user} projectId={projectId} />
      </SidebarFooter>
    </Sidebar>
  );
}
