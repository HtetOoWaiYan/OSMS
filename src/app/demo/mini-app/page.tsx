import { ProductGrid } from '@/components/mini-app/product/product-grid';
import { MiniAppHeader } from '@/components/mini-app/layout/mini-app-header';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Suspense } from 'react';

// Demo product data
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

export default function MiniAppDemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <MiniAppHeader 
        projectId="demo-project"
        projectName="Purple Shopping Demo"
        showSearch={false}
      />
      
      <main className="container mx-auto max-w-md px-4 py-6">
        {/* Demo mode notice */}
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/20">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              📱 Telegram Mini-App Demo
            </span>
          </div>
          <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
            This demonstrates the customer-facing e-commerce interface for Purple Shopping
          </p>
        </div>

        {/* Search Bar Demo */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-10"
              defaultValue=""
            />
          </div>
        </div>

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
          <ProductGrid items={demoProducts} />
        </Suspense>

        {/* Features showcase */}
        <div className="mt-8 space-y-4">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/20">
            <h3 className="mb-2 font-semibold text-green-700 dark:text-green-300">✅ Implemented Features</h3>
            <ul className="space-y-1 text-sm text-green-600 dark:text-green-400">
              <li>• Product listing with search functionality</li>
              <li>• Shopping cart with persistent state</li>
              <li>• Add to cart with stock validation</li>
              <li>• Mobile-optimized responsive design</li>
              <li>• Telegram authentication integration</li>
              <li>• Server-side caching for performance</li>
            </ul>
          </div>

          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-950/20">
            <h3 className="mb-2 font-semibold text-purple-700 dark:text-purple-300">🚀 Coming Next</h3>
            <ul className="space-y-1 text-sm text-purple-600 dark:text-purple-400">
              <li>• Detailed product pages</li>
              <li>• Complete checkout process</li>
              <li>• Payment method integration</li>
              <li>• Order tracking and history</li>
              <li>• Real-time database integration</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}