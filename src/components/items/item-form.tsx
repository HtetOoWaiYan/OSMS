'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createItemActionSimple } from '@/lib/actions/items';
import { uploadMultipleItemImagesAction } from '@/lib/actions/item-images';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { CreateCategoryDialog } from './create-category-dialog';
import { ImageUpload } from './image-upload';
import { generateSKU, calculateSellingPrice } from '@/lib/utils/item-utils';
import type { Tables } from '@/lib/supabase/database.types';

type Category = Tables<'categories'>;

interface ItemFormProps {
  projectId: string;
  categories: Category[];
}

export function ItemForm({ projectId, categories }: ItemFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    basePrice: '',
    sellingPrice: '',
    discountPercentage: '',
  });
  const router = useRouter();

  const handleImagesChange = (files: File[]) => {
    setImageFiles(files);
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null); // Clear any previous errors

    try {
      const formData = new FormData(event.currentTarget);
      formData.append('projectId', projectId);

      // Validate required fields before submission
      const name = formData.get('name') as string;
      if (!name || name.trim().length === 0) {
        setError('Product name is required. Please enter a name for your item.');
        setIsSubmitting(false);
        return;
      }

      // Create the item first
      const itemResult = await createItemActionSimple(formData);

      if (itemResult.success && itemResult.data?.id) {
        // Upload images if any were selected
        if (imageFiles.length > 0) {
          const imageResult = await uploadMultipleItemImagesAction(
            itemResult.data.id,
            projectId,
            imageFiles,
          );

          if (!imageResult.success) {
            // Show specific upload errors with better formatting
            const uploadErrors =
              imageResult.results
                ?.filter((r) => !r.success)
                .map((r) => r.error)
                .filter(Boolean) || [];

            if (uploadErrors.length > 0) {
              const errorMessage =
                uploadErrors.length === 1
                  ? `Item created successfully, but image upload failed: ${uploadErrors[0]}`
                  : `Item created successfully, but ${uploadErrors.length} image uploads failed. Please try uploading images again later.`;
              toast.error(errorMessage);
            } else {
              toast.error(
                `Item created successfully, but image upload failed: ${imageResult.error}`,
              );
            }
          } else {
            const successCount = imageResult.results?.filter((r) => r.success).length || 0;
            if (successCount > 0) {
              toast.success(
                `Item created successfully with ${successCount} image${successCount !== 1 ? 's' : ''}!`,
              );
            } else {
              toast.success('Item created successfully!');
            }
          }
        } else {
          toast.success('Item created successfully!');
        }

        router.push(`/dashboard/${projectId}/items`);
      } else {
        // Enhanced error handling with specific error messages
        const errorMessage = itemResult.error || 'Failed to create item';

        // Provide more user-friendly error messages
        if (errorMessage.includes('duplicate') || errorMessage.includes('unique')) {
          setError(
            'An item with this name or SKU already exists. Please choose a different name or SKU.',
          );
        } else if (errorMessage.includes('permission') || errorMessage.includes('access')) {
          setError(
            "You don't have permission to create items in this project. Please contact your administrator.",
          );
        } else if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
          setError('Please check your input and ensure all required fields are filled correctly.');
        } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
          setError('Network error. Please check your internet connection and try again.');
        } else {
          setError(`Unable to create item: ${errorMessage}`);
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);

      // Handle specific error types
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError('Network error. Please check your internet connection and try again.');
      } else if (error instanceof Error) {
        setError(`An unexpected error occurred: ${error.message}`);
      } else {
        setError(
          'An unexpected error occurred. Please try again or contact support if the problem persists.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-4">
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

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your product"
              className="min-h-[100px]"
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
                    const nameInput = document.getElementById('name') as HTMLInputElement;
                    const skuInput = document.getElementById('sku') as HTMLInputElement;
                    if (nameInput?.value) {
                      const newSKU = generateSKU(nameInput.value);
                      if (skuInput) skuInput.value = newSKU;
                      setFormData((prev) => ({ ...prev, sku: newSKU }));
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
              <Select name="categoryId">
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stockQuantity">Stock Quantity</Label>
              <Input
                id="stockQuantity"
                name="stockQuantity"
                type="number"
                min="0"
                defaultValue="0"
              />
            </div>

            <div>
              <Label htmlFor="minStockLevel">Min Stock Level</Label>
              <Input
                id="minStockLevel"
                name="minStockLevel"
                type="number"
                min="0"
                defaultValue="0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input id="weight" name="weight" type="number" step="0.01" min="0" placeholder="0.00" />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div>
            <h3 className="mb-4 text-lg font-semibold">Pricing</h3>

            <div className="mb-4 grid grid-cols-2 gap-4">
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

          <ImageUpload
            label="Product Images"
            maxFiles={5}
            maxSizeInMB={1}
            onImagesChange={handleImagesChange}
            className="mb-4"
          />

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input id="tags" name="tags" placeholder="tag1, tag2, tag3" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isFeatured"
                name="isFeatured"
                value="true"
                className="rounded"
              />
              <Label htmlFor="isFeatured">Featured Item</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                value="true"
                defaultChecked
                className="rounded"
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Unable to create item</p>
              <p className="text-sm">{error}</p>
              <p className="text-muted-foreground text-xs">
                Please check your input and try again. If the problem persists, contact support.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Item'
          )}
        </Button>
      </div>
    </form>
  );
}
