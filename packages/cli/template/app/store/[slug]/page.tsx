import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductDetailClient from './ProductDetailClient'
import type { Product } from '@/types'

const storeName = process.env.NEXT_PUBLIC_STORE_NAME ?? 'My Store'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  try {
    const supabase = await createClient()
    const { data: product } = await supabase
      .from('products')
      .select('name, description')
      .eq('slug', slug)
      .single()
    if (!product) return {}
    return {
      title: `${(product as Pick<Product, 'name'>).name} — ${storeName}`,
      description: (product as Pick<Product, 'description'>).description,
    }
  } catch {
    return {}
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!product) notFound()

  return <ProductDetailClient product={product as Product} />
}
