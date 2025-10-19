export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          age_group: string[] | null
          display_order: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          age_group?: string[] | null
          display_order?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          age_group?: string[] | null
          display_order?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          sku: string
          description: string | null
          story: string | null
          price: number
          price_usd: number | null
          price_eur: number | null
          price_gbp: number | null
          size: string
          age_group: string
          color_primary: string | null
          color_secondary: string | null
          fabric: string | null
          care_instructions: string | null
          measurements: Json | null
          is_featured: boolean | null
          is_sold: boolean | null
          sold_at: string | null
          is_reserved: boolean | null
          reserved_until: string | null
          is_draft: boolean | null
          category_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          sku: string
          description?: string | null
          story?: string | null
          price: number
          price_usd?: number | null
          price_eur?: number | null
          price_gbp?: number | null
          size: string
          age_group: string
          color_primary?: string | null
          color_secondary?: string | null
          fabric?: string | null
          care_instructions?: string | null
          measurements?: Json | null
          is_featured?: boolean | null
          is_sold?: boolean | null
          sold_at?: string | null
          is_reserved?: boolean | null
          reserved_until?: string | null
          is_draft?: boolean | null
          category_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          sku?: string
          description?: string | null
          story?: string | null
          price?: number
          price_usd?: number | null
          price_eur?: number | null
          price_gbp?: number | null
          size?: string
          age_group?: string
          color_primary?: string | null
          color_secondary?: string | null
          fabric?: string | null
          care_instructions?: string | null
          measurements?: Json | null
          is_featured?: boolean | null
          is_sold?: boolean | null
          sold_at?: string | null
          is_reserved?: boolean | null
          reserved_until?: string | null
          is_draft?: boolean | null
          category_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      product_images: {
        Row: {
          id: string
          product_id: string | null
          url: string
          alt_text: string | null
          is_primary: boolean | null
          display_order: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          product_id?: string | null
          url: string
          alt_text?: string | null
          is_primary?: boolean | null
          display_order?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          product_id?: string | null
          url?: string
          alt_text?: string | null
          is_primary?: boolean | null
          display_order?: number | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      customer_profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          currency_preference: string | null
          is_admin: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          currency_preference?: string | null
          is_admin?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          currency_preference?: string | null
          is_admin?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          id: string
          customer_id: string | null
          status: string
          currency: string | null
          subtotal: number
          gst_amount: number | null
          shipping_cost: number
          total_amount: number
          exchange_rate: number | null
          shipping_address: Json
          billing_address: Json
          tracking_number: string | null
          stripe_payment_intent_id: string | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          customer_id?: string | null
          status?: string
          currency?: string | null
          subtotal: number
          gst_amount?: number | null
          shipping_cost?: number
          total_amount: number
          exchange_rate?: number | null
          shipping_address: Json
          billing_address: Json
          tracking_number?: string | null
          stripe_payment_intent_id?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          customer_id?: string | null
          status?: string
          currency?: string | null
          subtotal?: number
          gst_amount?: number | null
          shipping_cost?: number
          total_amount?: number
          exchange_rate?: number | null
          shipping_address?: Json
          billing_address?: Json
          tracking_number?: string | null
          stripe_payment_intent_id?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string | null
          product_id: string | null
          price_at_purchase: number
          currency_at_purchase: string
          created_at: string | null
        }
        Insert: {
          id?: string
          order_id?: string | null
          product_id?: string | null
          price_at_purchase: number
          currency_at_purchase: string
          created_at?: string | null
        }
        Update: {
          id?: string
          order_id?: string | null
          product_id?: string | null
          price_at_purchase?: number
          currency_at_purchase?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      cart_items: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          product_id: string | null
          reserved_at: string | null
          expires_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          product_id?: string | null
          reserved_at?: string | null
          expires_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          product_id?: string | null
          reserved_at?: string | null
          expires_at?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      reviews: {
        Row: {
          id: string
          product_id: string | null
          customer_id: string | null
          order_id: string | null
          rating: number
          title: string | null
          comment: string | null
          is_verified_purchase: boolean | null
          helpful_count: number | null
          images: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          product_id?: string | null
          customer_id?: string | null
          order_id?: string | null
          rating: number
          title?: string | null
          comment?: string | null
          is_verified_purchase?: boolean | null
          helpful_count?: number | null
          images?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          product_id?: string | null
          customer_id?: string | null
          order_id?: string | null
          rating?: number
          title?: string | null
          comment?: string | null
          is_verified_purchase?: boolean | null
          helpful_count?: number | null
          images?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      wishlists: {
        Row: {
          id: string
          user_id: string | null
          product_id: string | null
          notify_similar: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          product_id?: string | null
          notify_similar?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          product_id?: string | null
          notify_similar?: boolean | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      similarity_notifications: {
        Row: {
          id: string
          user_id: string | null
          original_product_id: string | null
          size_preference: string | null
          age_group_preference: string | null
          color_preference: string | null
          active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          original_product_id?: string | null
          size_preference?: string | null
          age_group_preference?: string | null
          color_preference?: string | null
          active?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          original_product_id?: string | null
          size_preference?: string | null
          age_group_preference?: string | null
          color_preference?: string | null
          active?: boolean | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "similarity_notifications_original_product_id_fkey"
            columns: ["original_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "similarity_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      release_expired_reservations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      reserve_product: {
        Args: {
          product_uuid: string
          user_uuid: string
          session_uuid?: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}