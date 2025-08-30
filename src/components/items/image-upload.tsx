'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Upload, ImageIcon, AlertTriangle, Info } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

interface ExistingImage {
  id: string;
  image_url: string;
  alt_text?: string;
  is_primary?: boolean;
}

interface ImageUploadProps {
  label?: string;
  maxFiles?: number;
  maxSizeInMB?: number;
  existingImages?: ExistingImage[];
  onImagesChange?: (files: File[], removedImageIds: string[]) => void;
  className?: string;
}

export function ImageUpload({
  label = 'Product Images',
  maxFiles = 5,
  maxSizeInMB = 5,
  existingImages = [],
  onImagesChange,
  className = '',
}: ImageUploadProps) {
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    // Check total count including existing images
    const totalCount =
      imageFiles.length + existingImages.length - removedImageIds.length + files.length;
    if (totalCount > maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed`);
      return;
    }

    const validFiles: ImageFile[] = [];

    files.forEach((file) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image file`);
        return;
      }

      // Validate file size
      const sizeInMB = file.size / (1024 * 1024);
      if (sizeInMB > maxSizeInMB) {
        toast.error(`${file.name} is too large. Maximum size is ${maxSizeInMB}MB`);
        return;
      }

      // Create preview
      const preview = URL.createObjectURL(file);
      validFiles.push({
        file,
        preview,
        id: Math.random().toString(36).substr(2, 9),
      });
    });

    if (validFiles.length > 0) {
      const newImageFiles = [...imageFiles, ...validFiles];
      setImageFiles(newImageFiles);

      // Notify parent component
      const allFiles = newImageFiles.map((img) => img.file);
      onImagesChange?.(allFiles, removedImageIds);
    }

    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeNewImage = (id: string) => {
    setImageFiles((prev) => {
      const updated = prev.filter((img) => img.id !== id);
      const allFiles = updated.map((img) => img.file);
      onImagesChange?.(allFiles, removedImageIds);
      return updated;
    });
  };

  const removeExistingImage = (imageId: string) => {
    const updatedRemovedIds = [...removedImageIds, imageId];
    setRemovedImageIds(updatedRemovedIds);

    const allFiles = imageFiles.map((img) => img.file);
    onImagesChange?.(allFiles, updatedRemovedIds);
  };

  const restoreExistingImage = (imageId: string) => {
    const updatedRemovedIds = removedImageIds.filter((id) => id !== imageId);
    setRemovedImageIds(updatedRemovedIds);

    const allFiles = imageFiles.map((img) => img.file);
    onImagesChange?.(allFiles, updatedRemovedIds);
  };

  const currentImageCount = imageFiles.length + existingImages.length - removedImageIds.length;
  const isAtLimit = currentImageCount >= maxFiles;
  const isNearLimit = currentImageCount >= maxFiles - 1 && currentImageCount < maxFiles;
  const hasRemovedImages = removedImageIds.length > 0;

  return (
    <div className={className}>
      <Label className="text-sm font-medium">{label}</Label>

      {/* Image Limit Warnings */}
      {isAtLimit && (
        <Alert className="mt-2 border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Maximum limit reached ({currentImageCount}/{maxFiles} images). Remove existing images to
            add new ones.
          </AlertDescription>
        </Alert>
      )}

      {isNearLimit && !isAtLimit && (
        <Alert className="mt-2 border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Almost at limit ({currentImageCount}/{maxFiles} images). You can add{' '}
            {maxFiles - currentImageCount} more image{maxFiles - currentImageCount !== 1 ? 's' : ''}
            .
          </AlertDescription>
        </Alert>
      )}

      {hasRemovedImages && (
        <Alert className="mt-2 border-orange-200 bg-orange-50">
          <Info className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            {removedImageIds.length} image{removedImageIds.length !== 1 ? 's' : ''} marked for
            deletion. Click &ldquo;Update Item&rdquo; to save changes.
            {existingImages.some((img) => img.is_primary && removedImageIds.includes(img.id)) && (
              <div className="mt-1 text-sm font-medium">
                ⚠️ Primary image will be deleted. The next available image will automatically become
                the new primary image.
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
      <div className="mt-2">
        {/* Upload Button */}
        {currentImageCount < maxFiles && (
          <div className="mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-dashed"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Images ({currentImageCount}/{maxFiles})
            </Button>
            <p className="text-muted-foreground mt-1 text-xs">
              Max {maxFiles} images, up to {maxSizeInMB}MB each. JPG, PNG, GIF supported.
            </p>
          </div>
        )}

        {/* Image Previews */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {/* Existing Images */}
          {existingImages.map((image) => (
            <div
              key={image.id}
              className={`group relative overflow-hidden rounded-lg border ${
                removedImageIds.includes(image.id) ? 'opacity-50' : ''
              }`}
            >
              <div className="relative aspect-square">
                <Image
                  src={image.image_url}
                  alt={image.alt_text || 'Product image'}
                  fill
                  className="object-cover"
                />
                {image.is_primary && (
                  <div className="absolute top-2 left-2 rounded bg-blue-500 px-2 py-1 text-xs text-white">
                    Primary
                  </div>
                )}
              </div>

              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-200 group-hover:bg-black/50">
                {removedImageIds.includes(image.id) ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => restoreExistingImage(image.id)}
                    className="opacity-0 group-hover:opacity-100"
                  >
                    Restore
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => removeExistingImage(image.id)}
                    className="opacity-0 group-hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          {/* New Images */}
          {imageFiles.map((image) => (
            <div key={image.id} className="group relative overflow-hidden rounded-lg border">
              <div className="relative aspect-square">
                <Image src={image.preview} alt="New product image" fill className="object-cover" />
                <div className="absolute top-2 left-2 rounded bg-green-500 px-2 py-1 text-xs text-white">
                  New
                </div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-200 group-hover:bg-black/50">
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => removeNewImage(image.id)}
                  className="opacity-0 group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {currentImageCount === 0 && (
            <div className="border-muted-foreground/25 col-span-2 rounded-lg border-2 border-dashed p-8 text-center md:col-span-3">
              <ImageIcon className="text-muted-foreground/50 mx-auto h-12 w-12" />
              <p className="text-muted-foreground mt-2 text-sm">No images uploaded yet</p>
              <p className="text-muted-foreground text-xs">
                Click &ldquo;Upload Images&rdquo; to add product photos
              </p>
            </div>
          )}
        </div>

        {/* Hidden inputs for form submission */}
        {removedImageIds.map((imageId) => (
          <input key={`removed-${imageId}`} type="hidden" name="removedImageIds" value={imageId} />
        ))}
      </div>
    </div>
  );
}
