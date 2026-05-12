export type OrderStatus =
  | "pending"
  | "pending_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled"

export type DeliveryMethod = "cdek" | "boxberry" | "russian_post" | "courier"

export type PaymentMethod =
  | "yoomoney"
  | "card"
  | "sbp"
  | "cod"

export interface Product {
  id: string
  title: string
  slug: string
  description: string
  price: number
  originalPrice?: number | null
  images: string[]
  category: string
  stock: number
  featured?: boolean | null
  badge?: string | null
  createdAt?: string | null
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Customer {
  fullName: string
  phone: string
  email?: string | null
  city: string
  address: string
  apartment?: string | null
  postalCode?: string | null
  comment?: string | null
}

export interface Order {
  id: string
  customerName: string
  phone: string
  email?: string | null
  address: string
  city?: string | null
  apartment?: string | null
  postalCode?: string | null
  comment?: string | null
  total: number
  status: OrderStatus
  deliveryMethod?: DeliveryMethod | null
  paymentMethod?: PaymentMethod | null
  yookassaPaymentId?: string | null
  createdAt?: string | null
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  price: number
}
