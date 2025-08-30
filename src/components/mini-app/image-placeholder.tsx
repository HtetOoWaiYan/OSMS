'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Package, ShoppingBag } from 'lucide-react';

interface ImagePlaceholderProps {
  src?: string | null;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  placeholder?: 'product' | 'package';
}

export function ImagePlaceholder({
  src,
  alt,
  fill = false,
  width,
  height,
  className = '',
  sizes,
  priority = false,
  placeholder = 'product',
}: ImagePlaceholderProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const PlaceholderIcon = placeholder === 'package' ? Package : ShoppingBag;

  // Show placeholder if no src, src is empty, or image failed to load
  if (!src || imageError) {
    return (
      <div
        className={`from-muted to-muted/80 flex items-center justify-center bg-gradient-to-br ${className}`}
      >
        <div className="text-muted-foreground text-center">
          <div className="bg-muted-foreground/20 mx-auto flex h-8 w-8 items-center justify-center rounded-full">
            <PlaceholderIcon className="h-4 w-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Loading placeholder */}
      {imageLoading && (
        <div className="from-muted to-muted/80 absolute inset-0 flex animate-pulse items-center justify-center bg-gradient-to-br">
          <div className="text-muted-foreground text-center">
            <div className="bg-muted-foreground/20 mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full">
              <PlaceholderIcon className="h-4 w-4" />
            </div>
            <p className="text-xs font-medium">Loading...</p>
          </div>
        </div>
      )}

      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={`transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'} ${className}`}
        sizes={sizes}
        priority={priority}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
    </div>
  );
}
