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
      products: {
        Row: {
          id: string
          title: string
          slug: string
          description: string | null
          price: number | string
          original_price: number | string | null
          images: Json
          category: string
          stock: number
          featured: boolean | null
          badge: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description?: string | null
          price: number
          original_price?: number | null
          images?: Json
          category: string
          stock?: number
          featured?: boolean | null
          badge?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string | null
          price?: number
          original_price?: number | null
          images?: Json
          category?: string
          stock?: number
          featured?: boolean | null
          badge?: string | null
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          customer_name: string
          phone: string
          email: string | null
          address: string
          city: string | null
          apartment: string | null
          postal_code: string | null
          comment: string | null
          total: number | string
          status: string
          delivery_method: string | null
          payment_method: string | null
          yookassa_payment_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          customer_name: string
          phone: string
          email?: string | null
          address: string
          city?: string | null
          apartment?: string | null
          postal_code?: string | null
          comment?: string | null
          total: number
          status?: string
          delivery_method?: string | null
          payment_method?: string | null
          yookassa_payment_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          customer_name?: string
          phone?: string
          email?: string | null
          address?: string
          city?: string | null
          apartment?: string | null
          postal_code?: string | null
          comment?: string | null
          total?: number
          status?: string
          delivery_method?: string | null
          payment_method?: string | null
          yookassa_payment_id?: string | null
          created_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price: number | string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          price: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price?: number
        }
      }
    }
  }
}
