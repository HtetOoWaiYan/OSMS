import { notFound } from 'next/navigation';
import { MiniAppLayout } from '@/components/mini-app/mini-app-layout';
import { ItemImageGallery } from '@/components/mini-app/item-image-gallery';
import { ItemInfo } from '@/components/mini-app/item-info';
import { AddToCartSection } from '@/components/mini-app/add-to-cart-section';
import { RelatedProducts } from '@/components/mini-app/related-products';
import { getItemDetailForMiniApp, getRelatedItemsForMiniApp } from '@/lib/data/mini-app';

interface ItemDetailPageProps {
  params: Promise<{
    'project-id': string;
    'item-id': string;
  }>;
}

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const { 'project-id': projectId, 'item-id': itemId } = await params;

  // Fetch item details with caching
  const item = await getItemDetailForMiniApp(itemId);

  if (!item) {
    notFound();
  }

  // Fetch related items if item has a category
  const relatedItems = item.category?.id
    ? await getRelatedItemsForMiniApp(item.category.id, itemId)
    : [];

  return (
    <MiniAppLayout
      projectId={projectId}
      showBottomNav={false} // Hide bottom nav for better UX on detail page
    >
      <div className="min-h-screen bg-gray-50">
        {/* Image Gallery */}
        <div className="bg-white">
          <ItemImageGallery images={item.item_images || []} itemName={item.name} />
        </div>

        {/* Item Information */}
        <div className="mt-2 bg-white">
          <ItemInfo item={item} />
        </div>

        {/* Related Products */}
        {relatedItems.length > 0 && (
          <div className="mt-2 bg-white px-4 py-4">
            <RelatedProducts items={relatedItems} projectId={projectId} />
          </div>
        )}

        {/* Sticky Add to Cart Section */}
        <AddToCartSection item={item} />
      </div>
    </MiniAppLayout>
  );
}
