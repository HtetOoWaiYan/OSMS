'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface ItemImageGalleryProps {
  images: Array<{
    image_url: string;
    is_primary?: boolean | null;
    display_order?: number | null;
  }>;
  itemName: string;
}

export function ItemImageGallery({ images, itemName }: ItemImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // If no images, show placeholder
  if (!images || images.length === 0) {
    return (
      <div className="bg-muted flex aspect-square items-center justify-center">
        <div className="text-muted-foreground text-center">
          <ImageIcon className="mx-auto mb-4 h-16 w-16" />
          <p className="text-lg font-medium">No Image Available</p>
        </div>
      </div>
    );
  }

  const currentImage = images[currentImageIndex];
  const hasMultipleImages = images.length > 1;

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="bg-muted relative aspect-square overflow-hidden">
        <Image
          src={currentImage.image_url}
          alt={`${itemName} - Image ${currentImageIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={currentImageIndex === 0}
        />

        {/* Navigation arrows for multiple images */}
        {hasMultipleImages && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="bg-background/80 absolute top-1/2 left-2 h-8 w-8 -translate-y-1/2 rounded-full backdrop-blur"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="bg-background/80 absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 rounded-full backdrop-blur"
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Image counter */}
        {hasMultipleImages && (
          <div className="bg-background/80 absolute right-2 bottom-2 rounded px-2 py-1 text-xs backdrop-blur">
            {currentImageIndex + 1} of {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail navigation for multiple images */}
      {hasMultipleImages && (
        <div className="px-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                  index === currentImageIndex ? 'border-primary' : 'border-transparent'
                }`}
              >
                <Image
                  src={image.image_url}
                  alt={`${itemName} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
