import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  current_price: number;
  original_price?: number;
  quantity: number;
  stock_quantity: number;
  first_image_url?: string;
}

interface CartState {
  items: CartItem[];
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  // Computed
  getTotal: () => number;
  getTotalItems: () => number;
  getItem: (itemId: string) => CartItem | undefined;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const existingItem = get().items.find((i) => i.id === item.id);
        
        if (existingItem) {
          // Update quantity if item already exists
          set((state) => ({
            items: state.items.map((i) =>
              i.id === item.id
                ? { 
                    ...i, 
                    quantity: Math.min(i.quantity + 1, item.stock_quantity) 
                  }
                : i
            ),
          }));
        } else {
          // Add new item with quantity 1
          set((state) => ({
            items: [...state.items, { ...item, quantity: 1 }],
          }));
        }
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId
              ? { 
                  ...item, 
                  quantity: Math.min(quantity, item.stock_quantity) 
                }
              : item
          ),
        }));
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.current_price * item.quantity,
          0
        );
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getItem: (itemId) => {
        return get().items.find((item) => item.id === itemId);
      },
    }),
    {
      name: 'purple-shopping-cart',
      // Only persist in Telegram WebApp environment
      skipHydration: typeof window !== 'undefined' && !window.Telegram?.WebApp,
    }
  )
);