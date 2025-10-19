import type { Database } from './database'

// Extract types from database schema
export type Product = Database['public']['Tables']['products']['Row']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type ProductUpdate = Database['public']['Tables']['products']['Update']

export type ProductImage = Database['public']['Tables']['product_images']['Row']
export type ProductImageInsert = Database['public']['Tables']['product_images']['Insert']

export type Category = Database['public']['Tables']['categories']['Row']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']

export type CustomerProfile = Database['public']['Tables']['customer_profiles']['Row']
export type CustomerProfileInsert = Database['public']['Tables']['customer_profiles']['Insert']
export type CustomerProfileUpdate = Database['public']['Tables']['customer_profiles']['Update']

export type Order = Database['public']['Tables']['orders']['Row']
export type OrderInsert = Database['public']['Tables']['orders']['Insert']
export type OrderUpdate = Database['public']['Tables']['orders']['Update']

export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type OrderItemInsert = Database['public']['Tables']['order_items']['Insert']

export type CartItem = Database['public']['Tables']['cart_items']['Row']
export type CartItemInsert = Database['public']['Tables']['cart_items']['Insert']

export type Review = Database['public']['Tables']['reviews']['Row']
export type ReviewInsert = Database['public']['Tables']['reviews']['Insert']
export type ReviewUpdate = Database['public']['Tables']['reviews']['Update']

export type Wishlist = Database['public']['Tables']['wishlists']['Row']
export type WishlistInsert = Database['public']['Tables']['wishlists']['Insert']

// Custom types for product measurements
export interface ProductMeasurements {
  chest?: number
  length?: number
  sleeve?: number
  waist?: number
  inseam?: number
  shoulder?: number
}

// Product with related data
export interface ProductWithImages extends Product {
  product_images: ProductImage[]
  category?: Category
}

export interface ProductWithCategory extends Product {
  category?: Category
}

// Age group options
export type AgeGroup = '0-3m' | '3-12m' | '1-3y' | '3-5y' | '5-10y'

// Size options mapped to age groups
export const SIZE_OPTIONS: Record<AgeGroup, string[]> = {
  '0-3m': ['00', '0'],
  '3-12m': ['0', '1'],
  '1-3y': ['1', '2'],
  '3-5y': ['3', '4', '5'],
  '5-10y': ['6', '7', '8', '9', '10']
}

// Color options
export const COLOR_OPTIONS = [
  'Pink', 'Blue', 'White', 'Cream', 'Yellow', 'Green', 'Purple', 'Red',
  'Orange', 'Navy', 'Grey', 'Black', 'Coral', 'Mint', 'Lavender'
]

// Fabric options
export const FABRIC_OPTIONS = [
  'Cotton', 'Organic Cotton', 'Bamboo', 'Linen', 'Jersey', 'Muslin',
  'Flannel', 'Corduroy', 'Denim', 'Fleece', 'Cotton Blend'
]

// Order status types
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

// Product status for UI
export type ProductStatus = 'available' | 'reserved' | 'sold' | 'draft'

export const getProductStatus = (product: Product): ProductStatus => {
  if (product.is_draft) return 'draft'
  if (product.is_sold) return 'sold'
  if (product.is_reserved && product.reserved_until && new Date(product.reserved_until) > new Date()) {
    return 'reserved'
  }
  return 'available'
}

// Cart with reservation info
export interface CartItemWithProduct extends CartItem {
  product: ProductWithImages
  timeRemaining?: number
}

// Review with customer info
export interface ReviewWithCustomer extends Review {
  customer_profile?: {
    first_name: string | null
    last_name: string | null
  }
}

// Order with items and customer
export interface OrderWithItems extends Order {
  order_items: (OrderItem & {
    product: ProductWithImages
  })[]
  customer_profile?: CustomerProfile
}

// Admin dashboard stats
export interface AdminStats {
  totalProducts: number
  availableProducts: number
  soldProducts: number
  reservedProducts: number
  totalOrders: number
  recentOrders: OrderWithItems[]
}