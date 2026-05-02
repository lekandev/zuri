import { createClient } from '@/lib/supabase/server'
import StoreClient from './StoreClient'
import type { Product } from '@/types'

const storeName = process.env.NEXT_PUBLIC_STORE_NAME ?? 'My Store'

export const metadata = {
  title: `Shop — ${storeName}`,
  description: `Browse the full ${storeName} collection.`,
}

async function getProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    return (data as Product[]) ?? []
  } catch {
    return []
  }
}

export default async function StorePage() {
  const products = await getProducts()
  return <StoreClient products={products} />
}
