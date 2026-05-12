"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Product } from "@/types"

export interface CartLine {
  product: Product
  quantity: number
}

type CartState = {
  items: CartLine[]
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartItemsCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addToCart: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              ),
            }
          }
          return { items: [...state.items, { product, quantity }] }
        })
      },
      removeFromCart: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        }))
      },
      updateQuantity: (productId, quantity) => {
        if (quantity < 1) return
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i,
          ),
        }))
      },
      clearCart: () => set({ items: [] }),
      getCartTotal: () =>
        get().items.reduce(
          (sum, i) => sum + i.product.price * i.quantity,
          0,
        ),
      getCartItemsCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: "atelier-cart-v2",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
)
