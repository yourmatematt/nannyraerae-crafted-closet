import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Currency } from '../utils/currency'
import type { CartItemWithProduct, Product } from '../../types'

interface CartStore {
  items: CartItemWithProduct[]
  currency: Currency
  addItem: (product: Product, expiresAt: Date) => void
  removeItem: (productId: string) => void
  updateItemExpiry: (productId: string, expiresAt: Date) => void
  clearCart: () => void
  setCurrency: (currency: Currency) => void
  getItemCount: () => number
  getTotalValue: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      currency: 'AUD',

      addItem: (product, expiresAt) => {
        set((state) => {
          // Remove existing item if it exists
          const filteredItems = state.items.filter(item => item.product_id !== product.id)

          // Create new cart item
          const newItem: CartItemWithProduct = {
            id: crypto.randomUUID(),
            user_id: null, // Will be set when user logs in
            session_id: crypto.randomUUID(),
            product_id: product.id,
            reserved_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString(),
            created_at: new Date().toISOString(),
            product: {
              ...product,
              product_images: [] // Will be loaded separately
            },
            timeRemaining: expiresAt.getTime() - Date.now()
          }

          return {
            ...state,
            items: [...filteredItems, newItem]
          }
        })
      },

      removeItem: (productId) => {
        set((state) => ({
          ...state,
          items: state.items.filter(item => item.product_id !== productId)
        }))
      },

      updateItemExpiry: (productId, expiresAt) => {
        set((state) => ({
          ...state,
          items: state.items.map(item =>
            item.product_id === productId
              ? {
                  ...item,
                  expires_at: expiresAt.toISOString(),
                  timeRemaining: expiresAt.getTime() - Date.now()
                }
              : item
          )
        }))
      },

      clearCart: () => {
        set((state) => ({ ...state, items: [] }))
      },

      setCurrency: (currency) => {
        set((state) => ({ ...state, currency }))
      },

      getItemCount: () => {
        return get().items.length
      },

      getTotalValue: () => {
        const { items, currency } = get()
        return items.reduce((total, item) => {
          const price = item.product.price // Will need currency conversion
          return total + price
        }, 0)
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        currency: state.currency
      })
    }
  )
)

interface AuthStore {
  user: any | null
  isAdmin: boolean
  setUser: (user: any) => void
  setIsAdmin: (isAdmin: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAdmin: false,

  setUser: (user) => {
    set((state) => ({ ...state, user }))
  },

  setIsAdmin: (isAdmin) => {
    set((state) => ({ ...state, isAdmin }))
  },

  logout: () => {
    set({ user: null, isAdmin: false })
  }
}))

interface UIStore {
  sidebarOpen: boolean
  cartOpen: boolean
  currencyModalOpen: boolean
  setSidebarOpen: (open: boolean) => void
  setCartOpen: (open: boolean) => void
  setCurrencyModalOpen: (open: boolean) => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: false,
  cartOpen: false,
  currencyModalOpen: false,

  setSidebarOpen: (open) => {
    set((state) => ({ ...state, sidebarOpen: open }))
  },

  setCartOpen: (open) => {
    set((state) => ({ ...state, cartOpen: open }))
  },

  setCurrencyModalOpen: (open) => {
    set((state) => ({ ...state, currencyModalOpen: open }))
  }
}))