'use client'

import { useState, useMemo } from 'react'
import ProductCard from '@/components/ProductCard'
import type { Product } from '@/types'

interface StoreClientProps {
  products: Product[]
}

export default function StoreClient({ products }: StoreClientProps) {
  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category).filter((c): c is string => Boolean(c)))]
    return cats.length > 0 ? ['All', ...cats] : []
  }, [products])

  const sizes = useMemo(() => {
    const all = products.flatMap(p => p.sizes ?? [])
    const unique = [...new Set(all)]
    return unique.length > 0 ? ['All sizes', ...unique] : []
  }, [products])

  const [category, setCategory] = useState('All')
  const [size, setSize] = useState('All sizes')
  const [showAvailable, setShowAvailable] = useState(false)

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (category !== 'All' && p.category !== category) return false
      if (size !== 'All sizes' && !p.sizes?.includes(size)) return false
      if (showAvailable && !p.available) return false
      return true
    })
  }, [products, category, size, showAvailable])

  const pillClass = (active: boolean) =>
    `px-4 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
      active
        ? 'bg-gray-900 text-white border-gray-900'
        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-900'
    }`

  const hasFilters = categories.length > 0 || sizes.length > 0

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-10">
        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-2">The collection</p>
        <h1 className="text-4xl font-bold text-gray-900">Shop</h1>
      </div>

      {hasFilters && (
        <div className="flex gap-2 flex-wrap pb-6 overflow-x-auto">
          {categories.map(c => (
            <button key={c} className={pillClass(category === c)} onClick={() => setCategory(c)}>{c}</button>
          ))}

          {categories.length > 0 && sizes.length > 0 && (
            <div className="w-px bg-gray-200 self-stretch mx-1" />
          )}

          {sizes.map(s => (
            <button key={s} className={pillClass(size === s)} onClick={() => setSize(s)}>{s}</button>
          ))}

          {(categories.length > 0 || sizes.length > 0) && (
            <div className="w-px bg-gray-200 self-stretch mx-1" />
          )}

          <button className={pillClass(showAvailable)} onClick={() => setShowAvailable(v => !v)}>
            In stock only
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-sm text-gray-400 mb-4">No products match this filter.</p>
          <button
            onClick={() => { setCategory('All'); setSize('All sizes'); setShowAvailable(false) }}
            className="text-sm font-medium text-gray-700 underline underline-offset-2 hover:text-gray-900 transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  )
}
