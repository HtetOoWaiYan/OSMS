import { MiniAppLayout } from '@/components/mini-app/mini-app-layout';
import { FeaturedProducts } from '@/components/mini-app/featured-products';
import { ProductGrid } from '@/components/mini-app/product-grid';
import {
  getItemsForMiniApp,
  getFeaturedItemsForMiniApp,
  getCategoriesForMiniApp,
} from '@/lib/data/mini-app';
import type { ItemFilters } from '@/lib/data/mini-app';

interface AppPageProps {
  params: Promise<{ 'project-id': string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AppPage({ params, searchParams }: AppPageProps) {
  const { 'project-id': projectId } = await params;
  const searchParamsResolved = await searchParams;

  // Parse search parameters for filtering
  const filters: ItemFilters = {
    search: typeof searchParamsResolved.q === 'string' ? searchParamsResolved.q : undefined,
    category:
      typeof searchParamsResolved.category === 'string' ? searchParamsResolved.category : undefined,
    sort:
      typeof searchParamsResolved.sort === 'string'
        ? (searchParamsResolved.sort as 'name' | 'price' | 'created_at')
        : 'created_at',
    order:
      typeof searchParamsResolved.order === 'string'
        ? (searchParamsResolved.order as 'asc' | 'desc')
        : 'desc',
  };

  // Fetch data server-side with caching
  const [items, featuredItems, categories] = await Promise.all([
    getItemsForMiniApp(projectId, filters),
    getFeaturedItemsForMiniApp(projectId),
    getCategoriesForMiniApp(projectId),
  ]);

  return (
    <MiniAppLayout projectId={projectId}>
      <div className="min-h-screen bg-gray-50">
        {/* Featured Products Section */}
        {!filters.search && !filters.category && featuredItems.length > 0 && (
          <div className="border-b border-gray-100 bg-white">
            <div className="px-4 py-4">
              <FeaturedProducts items={featuredItems} projectId={projectId} />
            </div>
          </div>
        )}

        {/* Main Products Section */}
        <div className="bg-white">
          <div className="px-1">
            <ProductGrid
              items={items}
              categories={categories}
              projectId={projectId}
              title={
                filters.search
                  ? `Search: "${filters.search}"`
                  : filters.category
                    ? `${categories.find((c) => c.id === filters.category)?.name || 'Category'}`
                    : 'All Products'
              }
            />
          </div>
        </div>

        {/* Bottom Spacing for mobile */}
        <div className="h-4 bg-gray-50" />
      </div>
    </MiniAppLayout>
  );
}
