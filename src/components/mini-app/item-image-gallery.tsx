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
      <div className="from-muted to-muted/80 flex aspect-square items-center justify-center bg-gradient-to-br">
        <div className="text-muted-foreground text-center">
          <div className="bg-muted-foreground/20 mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full">
            <ImageIcon className="h-8 w-8" />
          </div>
          <p className="text-sm font-medium">No Image Available</p>
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
    <div className="space-y-3">
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
              className="absolute top-1/2 left-3 h-9 w-9 -translate-y-1/2 rounded-full border-0 bg-white/90 shadow-lg"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="absolute top-1/2 right-3 h-9 w-9 -translate-y-1/2 rounded-full border-0 bg-white/90 shadow-lg"
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Image counter */}
        {hasMultipleImages && (
          <div className="absolute right-3 bottom-3 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white">
            {currentImageIndex + 1} / {images.length}
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
