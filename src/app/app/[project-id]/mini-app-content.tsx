'use client';

import { useTelegramUser, useIsTelegram } from '@/components/telegram-provider';
import { ProductGrid } from '@/components/mini-app/product/product-grid';
import { MiniAppHeader } from '@/components/mini-app/layout/mini-app-header';
import { Input } from '@/components/ui/input';
import { useState, useEffect, Suspense } from 'react';
import { Search } from 'lucide-react';

// Product data - in a real app this would come from server
const demoProducts = [
  {
    id: '1',
    name: 'Wireless Bluetooth Earbuds',
    current_price: 45000,
    original_price: 55000,
    stock_quantity: 12,
    first_image_url: undefined
  },
  {
    id: '2', 
    name: 'Smartphone Case with Card Holder',
    current_price: 15000,
    stock_quantity: 25,
    first_image_url: undefined
  },
  {
    id: '3',
    name: 'Portable Power Bank 10000mAh',
    current_price: 32000,
    stock_quantity: 8,
    first_image_url: undefined
  },
  {
    id: '4',
    name: 'USB-C Fast Charging Cable',
    current_price: 8000,
    original_price: 12000,
    stock_quantity: 30,
    first_image_url: undefined
  },
  {
    id: '5',
    name: 'Laptop Stand Adjustable',
    current_price: 28000,
    stock_quantity: 0,
    first_image_url: undefined
  },
  {
    id: '6',
    name: 'LED Desk Lamp with Touch Control',
    current_price: 38000,
    original_price: 45000,
    stock_quantity: 5,
    first_image_url: undefined
  }
];

export default function MiniAppContent() {
  const { user, project, isLoading, error, isAuthenticated } = useTelegramUser();
  const isTelegram = useIsTelegram();
  
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(demoProducts);

  // Filter products based on search
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = demoProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(demoProducts);
    }
  }, [searchQuery]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="rounded-lg border bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-950/20">
          <div className="flex items-center space-x-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-blue-700 dark:text-blue-300">Connecting to Telegram...</span>
          </div>
        </div>
      </div>
    );
  }

  // Not in Telegram environment - show demo mode for development
  if (!isTelegram) {
    return (
      <div className="min-h-screen bg-background">
        <MiniAppHeader 
          projectId="demo-project"
          projectName="Purple Shopping Demo"
          showSearch={showSearch}
          onSearchToggle={() => setShowSearch(!showSearch)}
        />
        
        <main className="container mx-auto max-w-md px-4 py-6">
          {/* Demo mode notice */}
          <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950/20">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
              <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                🚀 Demo Mode
              </span>
            </div>
            <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
              This is a demonstration of the Telegram Mini-App interface
            </p>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="mb-6 animate-in slide-in-from-top-2 duration-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Welcome Section */}
          <div className="mb-6 text-center">
            <h2 className="text-lg font-semibold mb-2">
              Welcome to Purple Shopping! 👋
            </h2>
            <p className="text-sm text-muted-foreground">
              Discover amazing products just for you
            </p>
          </div>

          {/* Product Grid */}
          <Suspense fallback={<ProductGrid items={[]} isLoading />}>
            <ProductGrid items={filteredProducts} />
          </Suspense>
        </main>
      </div>
    );
  }

  // Authentication error
  if (error || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950/20">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-red-500"></div>
            <span className="font-medium text-red-700 dark:text-red-300">
              ❌ Authentication Error
            </span>
          </div>
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {error || 'Failed to authenticate with Telegram'}
          </p>
          <p className="mt-1 text-xs text-red-500 dark:text-red-400">
            Please try reopening the app from Telegram.
          </p>
        </div>
      </div>
    );
  }

  // Success - show the main app
  return (
    <div className="min-h-screen bg-background">
      <MiniAppHeader 
        projectId={project?.id || 'demo'}
        projectName={project?.name}
        showSearch={showSearch}
        onSearchToggle={() => setShowSearch(!showSearch)}
      />
      
      <main className="container mx-auto max-w-md px-4 py-6">
        {/* Search Bar */}
        {showSearch && (
          <div className="mb-6 animate-in slide-in-from-top-2 duration-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-6 text-center">
          <h2 className="text-lg font-semibold mb-2">
            Welcome, {user?.first_name}! 👋
          </h2>
          <p className="text-sm text-muted-foreground">
            Discover amazing products just for you
          </p>
        </div>

        {/* Product Grid */}
        <Suspense fallback={<ProductGrid items={[]} isLoading />}>
          <ProductGrid items={filteredProducts} />
        </Suspense>

        {/* Development Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-8 rounded-lg border bg-gray-50 p-4 dark:bg-gray-950/20">
            <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300">
              🔍 Debug Info (Development Only)
            </summary>
            <div className="mt-3 space-y-2 font-mono text-xs">
              <div>
                <span className="text-gray-500">Project:</span>
                <span className="ml-2 text-gray-700 dark:text-gray-300">
                  {project?.name} ({project?.id})
                </span>
              </div>
              <div>
                <span className="text-gray-500">User ID:</span>
                <span className="ml-2 text-gray-700 dark:text-gray-300">{user?.id}</span>
              </div>
              <div>
                <span className="text-gray-500">Products loaded:</span>
                <span className="ml-2 text-gray-700 dark:text-gray-300">{filteredProducts.length}</span>
              </div>
            </div>
          </details>
        )}
      </main>
    </div>
  );
}
