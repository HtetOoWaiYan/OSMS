'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { updateItemActionSimple, getItemAction } from '@/lib/actions/items';
import {
  uploadMultipleItemImagesAction,
  deleteItemImageAction,
  getItemImagesAction,
} from '@/lib/actions/item-images';
import { generateSKU, calculateSellingPrice } from '@/lib/utils/item-utils';
import { CreateCategoryDialog } from './create-category-dialog';
import { ImageUpload } from './image-upload';
import { StockMovementHistory } from './stock-movement-history';
import { StockAdjustmentDialog } from './stock-adjustment-dialog';
import { toast } from 'sonner';
import type { Tables } from '@/lib/supabase/database.types';

type Category = Tables<'categories'>;
type ItemWithPrice = Tables<'items'> & {
  current_price?: Partial<Tables<'item_prices'>> | null;
  category?: Tables<'categories'> | null;
};

interface EditItemFormProps {
  projectId: string;
  itemId: string;
  categories: Category[];
}

export function EditItemForm({ projectId, itemId, categories }: EditItemFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [item, setItem] = useState<ItemWithPrice | null>(null);
  const [existingImages, setExistingImages] = useState<Tables<'item_images'>[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    basePrice: '',
    sellingPrice: '',
    discountPercentage: '',
  });
  const router = useRouter();

  const handleImagesChange = (files: File[], removedIds: string[]) => {
    setNewImageFiles(files);
    setRemovedImageIds(removedIds);
  };

  // Load item data on component mount
  useEffect(() => {
    async function loadItem() {
      try {
        setIsLoading(true);

        // Load item data
        const itemResult = await getItemAction(itemId);
        if (itemResult.success && itemResult.data) {
          setItem(itemResult.data);

          // Populate form with existing data
          setFormData({
            name: itemResult.data.name || '',
            sku: itemResult.data.sku || '',
            basePrice: itemResult.data.current_price?.base_price?.toString() || '',
            sellingPrice: itemResult.data.current_price?.selling_price?.toString() || '',
            discountPercentage:
              itemResult.data.current_price?.discount_percentage?.toString() || '',
          });

          // Load existing images
          const imagesResult = await getItemImagesAction(itemId);
          if (imagesResult.success && imagesResult.data) {
            setExistingImages(imagesResult.data);
          }
        } else {
          setError(itemResult.error || 'Failed to load item data');
        }
      } catch (err) {
        console.error('Error loading item:', err);
        setError('An unexpected error occurred while loading item data');
      } finally {
        setIsLoading(false);
      }
    }

    loadItem();
  }, [itemId]);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields before submission
      const name = formData.get('name') as string;
      if (!name || name.trim().length === 0) {
        setError('Product name is required. Please enter a name for your item.');
        setIsSubmitting(false);
        return;
      }

      // Add required fields for update
      formData.append('itemId', itemId);
      formData.append('projectId', projectId);

      // Update the item first
      const result = await updateItemActionSimple(formData);

      if (result.success) {
        let imageOperationsSuccessful = true;
        const imageOperationMessages: string[] = [];

        // Handle image deletions
        if (removedImageIds.length > 0) {
          const deleteErrors: string[] = [];
          for (const imageId of removedImageIds) {
            const deleteResult = await deleteItemImageAction(imageId, projectId);
            if (!deleteResult.success) {
              console.error('Failed to delete image:', imageId, deleteResult.error);
              deleteErrors.push(`Failed to delete image: ${deleteResult.error}`);
              imageOperationsSuccessful = false;
            }
          }

          if (deleteErrors.length > 0) {
            const deleteMessage =
              deleteErrors.length === 1
                ? `Image deletion failed: ${deleteErrors[0]}`
                : `${deleteErrors.length} image deletions failed. Please try again later.`;
            imageOperationMessages.push(deleteMessage);
            toast.error(deleteMessage);
          }
        }

        // Handle new image uploads
        if (newImageFiles.length > 0) {
          const uploadResult = await uploadMultipleItemImagesAction(
            itemId,
            projectId,
            newImageFiles,
          );
          if (!uploadResult.success) {
            console.error('Failed to upload images:', uploadResult.error);

            // Show specific upload errors with better formatting
            const uploadErrors =
              uploadResult.results
                ?.filter((r) => !r.success)
                .map((r) => r.error)
                .filter(Boolean) || [];

            if (uploadErrors.length > 0) {
              const uploadMessage =
                uploadErrors.length === 1
                  ? `Image upload failed: ${uploadErrors[0]}`
                  : `${uploadErrors.length} image uploads failed. Please try uploading images again later.`;
              imageOperationMessages.push(uploadMessage);
              toast.error(uploadMessage);
            } else {
              const uploadMessage = `Image upload failed: ${uploadResult.error}`;
              imageOperationMessages.push(uploadMessage);
              toast.error(uploadMessage);
            }

            imageOperationsSuccessful = false;
          } else {
            // Show success count
            const successCount = uploadResult.results?.filter((r) => r.success).length || 0;
            if (successCount > 0) {
              const successMessage = `${successCount} image${successCount !== 1 ? 's' : ''} uploaded successfully`;
              imageOperationMessages.push(successMessage);
              toast.success(successMessage);
            }
          }
        }

        if (imageOperationsSuccessful) {
          toast.success('Item updated successfully');
        } else {
          toast.success('Item updated, but some image operations failed');
        }

        router.push(`/dashboard/${projectId}/items`);
      } else {
        // Enhanced error handling with specific error messages
        const errorMessage = result.error || 'Failed to update item';

        // Provide more user-friendly error messages
        if (errorMessage.includes('duplicate') || errorMessage.includes('unique')) {
          setError(
            'An item with this name or SKU already exists. Please choose a different name or SKU.',
          );
        } else if (errorMessage.includes('permission') || errorMessage.includes('access')) {
          setError(
            "You don't have permission to update items in this project. Please contact your administrator.",
          );
        } else if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
          setError('Please check your input and ensure all required fields are filled correctly.');
        } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
          setError('Network error. Please check your internet connection and try again.');
        } else if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
          setError('The item you are trying to edit no longer exists or has been moved.');
        } else {
          setError(`Unable to update item: ${errorMessage}`);
        }
      }
    } catch (err) {
      console.error('Form submission error:', err);

      // Handle specific error types
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Network error. Please check your internet connection and try again.');
      } else if (err instanceof Error) {
        setError(`An unexpected error occurred: ${err.message}`);
      } else {
        setError(
          'An unexpected error occurred. Please try again or contact support if the problem persists.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading item data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!item) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <p className="text-muted-foreground">
              Item not found or you don&apos;t have access to it.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push(`/dashboard/${projectId}/items`)}
            >
              Back to Items
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Item: {item.name}</CardTitle>
        <CardDescription>Update the item information and settings</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>

            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="Enter product name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label htmlFor="sku">SKU</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (formData.name) {
                        const newSKU = generateSKU(formData.name);
                        setFormData((prev) => ({ ...prev, sku: newSKU }));
                        toast.success('New SKU generated');
                      } else {
                        toast.error('Enter item name first to generate SKU');
                      }
                    }}
                  >
                    <RefreshCw className="mr-1 h-3 w-3" />
                    Generate
                  </Button>
                </div>
                <Input
                  id="sku"
                  name="sku"
                  placeholder="Auto-generated if empty"
                  value={formData.sku}
                  onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))}
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label htmlFor="categoryId">Category</Label>
                  <CreateCategoryDialog projectId={projectId} />
                </div>
                <Select name="categoryId" defaultValue={item.category_id || 'no-category'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-category">No Category</SelectItem>
                    {categories.length === 0 ? (
                      <SelectItem value="no-categories" disabled>
                        No categories found. Create one first.
                      </SelectItem>
                    ) : (
                      categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter item description (optional)"
                defaultValue={item.description || ''}
              />
            </div>
          </div>

          <Separator />

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Pricing</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="basePrice">Base Price</Label>
                <Input
                  id="basePrice"
                  name="basePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.basePrice}
                  onChange={(e) => {
                    const newBasePrice = e.target.value;
                    setFormData((prev) => {
                      // Auto-calculate selling price if discount is set
                      if (prev.discountPercentage) {
                        const calculatedSellingPrice = calculateSellingPrice(
                          parseFloat(newBasePrice) || 0,
                          parseFloat(prev.discountPercentage) || 0,
                        );
                        return {
                          ...prev,
                          basePrice: newBasePrice,
                          sellingPrice: calculatedSellingPrice.toString(),
                        };
                      } else {
                        return { ...prev, basePrice: newBasePrice };
                      }
                    });
                  }}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="sellingPrice">Selling Price</Label>
                <Input
                  id="sellingPrice"
                  name="sellingPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.sellingPrice}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, sellingPrice: e.target.value }));
                  }}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="discountPercentage">Discount (%)</Label>
              <Input
                id="discountPercentage"
                name="discountPercentage"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.discountPercentage}
                onChange={(e) => {
                  const newDiscount = e.target.value;
                  setFormData((prev) => {
                    // Auto-calculate selling price if base price is set
                    if (prev.basePrice) {
                      const calculatedSellingPrice = calculateSellingPrice(
                        parseFloat(prev.basePrice) || 0,
                        parseFloat(newDiscount) || 0,
                      );
                      return {
                        ...prev,
                        discountPercentage: newDiscount,
                        sellingPrice: calculatedSellingPrice.toString(),
                      };
                    } else {
                      return { ...prev, discountPercentage: newDiscount };
                    }
                  });
                }}
                placeholder="0"
              />
            </div>
          </div>

          <Separator />

          {/* Physical Properties */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Physical Properties</h3>

            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                step="0.01"
                min="0"
                defaultValue={item.weight || ''}
                placeholder="0.00"
              />
            </div>
          </div>

          <Separator />

          {/* Stock Management */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Stock Management</h3>
              <StockAdjustmentDialog
                itemId={itemId}
                itemName={item.name}
                currentStock={item.stock_quantity}
                minStockLevel={item.min_stock_level || 0}
                projectId={projectId}
                defaultReason="manual_adjustment"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currentStock">Current Stock</Label>
                <Input
                  id="currentStock"
                  type="number"
                  value={item.stock_quantity || 0}
                  readOnly
                  className="bg-muted"
                />
                <p className="text-muted-foreground mt-1 text-xs">
                  Use &quot;Adjust Stock&quot; button to modify
                </p>
              </div>

              <div>
                <Label htmlFor="minStockLevel">Min Stock Alert Level</Label>
                <Input
                  id="minStockLevel"
                  type="number"
                  min="0"
                  defaultValue={item.min_stock_level || 0}
                  name="minStockLevel"
                  placeholder="0"
                />
                <p className="text-muted-foreground mt-1 text-xs">
                  Get notified when stock goes below this level
                </p>
              </div>
            </div>

            {item.stock_quantity <= (item.min_stock_level || 0) &&
              (item.min_stock_level || 0) > 0 && (
                <Alert>
                  <AlertDescription>
                    {`⚠️ Low stock alert: Current stock (${item.stock_quantity}) is at or below minimum level (${item.min_stock_level})`}
                  </AlertDescription>
                </Alert>
              )}
          </div>

          <Separator />

          {/* Product Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Product Images</h3>
            <ImageUpload
              label="Upload product images"
              maxFiles={5}
              maxSizeInMB={1}
              existingImages={existingImages.map((img) => ({
                id: img.id,
                image_url: img.image_url,
                alt_text: img.alt_text || undefined,
                is_primary: img.is_primary || undefined,
              }))}
              onImagesChange={handleImagesChange}
            />
          </div>

          <Separator />

          {/* Additional Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Additional Options</h3>

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                name="tags"
                placeholder="electronics, gadget, popular"
                defaultValue={item.tags?.join(', ') || ''}
              />
            </div>

            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isFeatured"
                  name="isFeatured"
                  defaultChecked={item.is_featured || false}
                />
                <Label htmlFor="isFeatured">Featured Item</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="isActive" name="isActive" defaultChecked={item.is_active || false} />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Unable to update item</p>
                  <p className="text-sm">{error}</p>
                  <p className="text-muted-foreground text-xs">
                    Please check your input and try again. If the problem persists, contact support.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Actions */}
          <div className="flex items-center space-x-4 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Item'
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => router.push(`/dashboard/${projectId}/items`)}
            >
              Cancel
            </Button>
          </div>
        </form>

        {/* Stock Movement History */}
        <div className="mt-6">
          <StockMovementHistory
            itemId={itemId}
            itemName={item?.name || 'Unknown Item'}
            currentStock={item?.stock_quantity || 0}
          />
        </div>
      </CardContent>
    </Card>
  );
}
