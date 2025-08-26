'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  maxStock: number;
  imageUrl?: string;
  sku?: string;
}

interface CartState {
  items: CartItem[];
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  isInCart: (itemId: string) => boolean;
  getCartItem: (itemId: string) => CartItem | undefined;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const { items } = get();
        const existingItem = items.find((cartItem) => cartItem.id === item.id);
        const quantityToAdd = item.quantity || 1;

        if (existingItem) {
          // Update quantity, but don't exceed max stock
          const newQuantity = Math.min(existingItem.quantity + quantityToAdd, item.maxStock);
          set({
            items: items.map((cartItem) =>
              cartItem.id === item.id ? { ...cartItem, quantity: newQuantity } : cartItem,
            ),
          });
        } else {
          // Add new item to cart
          const newItem: CartItem = {
            ...item,
            quantity: Math.min(quantityToAdd, item.maxStock),
          };
          set({ items: [...items, newItem] });
        }
      },

      updateQuantity: (itemId, quantity) => {
        const { items } = get();
        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          set({ items: items.filter((item) => item.id !== itemId) });
        } else {
          set({
            items: items.map((item) =>
              item.id === itemId ? { ...item, quantity: Math.min(quantity, item.maxStock) } : item,
            ),
          });
        }
      },

      removeItem: (itemId) => {
        const { items } = get();
        set({ items: items.filter((item) => item.id !== itemId) });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      isInCart: (itemId) => {
        const { items } = get();
        return items.some((item) => item.id === itemId);
      },

      getCartItem: (itemId) => {
        const { items } = get();
        return items.find((item) => item.id === itemId);
      },
    }),
    {
      name: 'mini-app-cart', // unique name for localStorage key
      // Only persist the items array
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
