import { createClient } from '@/lib/supabase/server'
import StoreClient from './StoreClient'

const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'My Store'

export const metadata = {
  title: `Shop — ${storeName}`,
  description: `Browse the full ${storeName} collection.`,
}

async function getProducts() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    return data || []
  } catch {
    return []
  }
}

export default async function StorePage() {
  const products = await getProducts()
  return <StoreClient products={products} />
}
