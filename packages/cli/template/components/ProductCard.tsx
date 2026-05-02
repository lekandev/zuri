import Link from 'next/link'
import type { Product } from '@/types'

const currencySymbol = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL ?? '₦'

interface ProductCardProps {
  product: Product
  className?: string
}

export default function ProductCard({ product, className = '' }: ProductCardProps) {
  return (
    <Link href={`/store/${product.slug}`} className={`group block ${className}`}>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
        <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
          )}
          {!product.available && (
            <span className="absolute top-2.5 right-2.5 bg-black/70 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-wide uppercase">
              Sold Out
            </span>
          )}
        </div>
        <div className="px-3.5 py-3 flex justify-between items-end gap-2">
          <p className="text-sm text-gray-500 font-medium truncate min-w-0">{product.name}</p>
          <p className="text-sm font-semibold text-gray-900 shrink-0">
            {currencySymbol}{Number(product.price).toLocaleString()}
          </p>
        </div>
      </div>
    </Link>
  )
}
