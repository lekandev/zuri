// ── Domain types ────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type OrderSource = 'paystack' | 'whatsapp'

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  images: string[]
  sizes: string[]
  colors: string[]
  category: string | null
  available: boolean
  featured: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  delivery_address: string | null
  items: CartItem[]
  total: number
  status: OrderStatus
  source: OrderSource
  paystack_ref: string | null
  notes: string | null
  created_at: string
}

export interface Subscriber {
  id: string
  email: string
  created_at: string
}

// ── Cart types ───────────────────────────────────────────────────

export interface CartItem {
  id: string
  name: string
  price: number
  images: string[]
  selectedSize: string
  slug: string
  quantity: number
}

export type AddToCartItem = Omit<CartItem, 'quantity'>

export interface Customer {
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
}

export interface CartContextValue {
  items: CartItem[]
  total: number
  count: number
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (item: AddToCartItem) => void
  removeItem: (id: string, selectedSize: string) => void
  updateQuantity: (id: string, selectedSize: string, quantity: number) => void
  clearCart: () => void
}

// ── Admin types ──────────────────────────────────────────────────

export interface ProductForm {
  name: string
  slug: string
  description: string
  price: string
  category: string
  sizes: string[]
  available: boolean
  featured: boolean
  images: string[]
}

// ── Paystack types ───────────────────────────────────────────────

export interface PaystackWebhookEvent {
  event: string
  data: {
    reference: string
    amount: number
    status: string
    customer: {
      email: string | null
      first_name: string | null
      phone: string | null
    }
    metadata: {
      customer_name?: string
      customer_phone?: string
      delivery_address?: string
      delivery_city?: string
      delivery_state?: string
      cart?: CartItem[]
    }
  }
}

export interface PaystackVerifyResponse {
  status: boolean
  data: {
    status: string
    amount: number
    reference: string
  }
}
