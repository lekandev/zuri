import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductDetailClient from './ProductDetailClient'

const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'My Store'

export async function generateMetadata({ params }) {
  const { slug } = await params
  try {
    const supabase = await createClient()
    const { data: product } = await supabase
      .from('products')
      .select('name, description')
      .eq('slug', slug)
      .single()
    if (!product) return {}
    return { title: `${product.name} — ${storeName}`, description: product.description }
  } catch {
    return {}
  }
}

export default async function ProductPage({ params }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!product) notFound()

  return <ProductDetailClient product={product} />
}
