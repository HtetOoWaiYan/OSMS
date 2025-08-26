'use client';

import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useCartStore, type CartItem } from '@/lib/stores/cart-store';
import Image from 'next/image';

interface ProductCardProps {
  item: {
    id: string;
    name: string;
    current_price?: number;
    original_price?: number;
    stock_quantity: number;
    first_image_url?: string;
  };
}

export function ProductCard({ item }: ProductCardProps) {
  const { addItem, updateQuantity, getItem } = useCartStore();
  const cartItem = getItem(item.id);
  
  const currentPrice = item.current_price || 0;
  const originalPrice = item.original_price;
  const isOnSale = originalPrice && originalPrice > currentPrice;
  const isOutOfStock = item.stock_quantity === 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    
    const cartItem: Omit<CartItem, 'quantity'> = {
      id: item.id,
      name: item.name,
      current_price: currentPrice,
      original_price: originalPrice,
      stock_quantity: item.stock_quantity,
      first_image_url: item.first_image_url,
    };
    
    addItem(cartItem);
  };

  const handleQuantityChange = (newQuantity: number) => {
    updateQuantity(item.id, newQuantity);
  };

  return (
    <div className="bg-card border rounded-lg overflow-hidden shadow-sm">
      {/* Product Image */}
      <div className="relative aspect-square">
        {item.first_image_url ? (
          <Image
            src={item.first_image_url}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <div className="text-muted-foreground text-4xl">📦</div>
          </div>
        )}
        
        {isOnSale && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            Sale
          </div>
        )}
        
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-medium">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-medium text-sm line-clamp-2 mb-2">{item.name}</h3>
        
        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="font-bold text-primary">
            {currentPrice.toLocaleString()} MMK
          </span>
          {isOnSale && originalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {originalPrice.toLocaleString()} MMK
            </span>
          )}
        </div>

        {/* Stock Info */}
        <div className="text-xs text-muted-foreground mb-3">
          {item.stock_quantity > 0 ? (
            `${item.stock_quantity} in stock`
          ) : (
            'Out of stock'
          )}
        </div>

        {/* Add to Cart / Quantity Controls */}
        {cartItem ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuantityChange(cartItem.quantity - 1)}
                disabled={cartItem.quantity <= 1}
                className="h-8 w-8 p-0"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="text-sm font-medium min-w-[2rem] text-center">
                {cartItem.quantity}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuantityChange(cartItem.quantity + 1)}
                disabled={cartItem.quantity >= item.stock_quantity}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <span className="text-xs text-muted-foreground">
              In cart
            </span>
          </div>
        ) : (
          <Button 
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            size="sm"
            className="w-full"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        )}
      </div>
    </div>
  );
}