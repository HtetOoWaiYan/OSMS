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
      <div className="container mx-auto max-w-md">
        {/* Image Gallery */}
        <ItemImageGallery images={item.item_images || []} itemName={item.name} />

        {/* Item Information */}
        <div className="space-y-6 px-4 py-6">
          <ItemInfo item={item} />

          {/* Add to Cart Section */}
          <AddToCartSection item={item} />

          {/* Related Products */}
          {relatedItems.length > 0 && (
            <RelatedProducts items={relatedItems} projectId={projectId} />
          )}
        </div>
      </div>
    </MiniAppLayout>
  );
}
