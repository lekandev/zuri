'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/lib/cart-context'

const storeName = process.env.NEXT_PUBLIC_STORE_NAME ?? 'My Store'

export default function Navbar() {
  const { count, openCart } = useCart()
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return null

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-base tracking-tight text-gray-900">
            {storeName}
          </Link>
          <div className="hidden sm:flex items-center gap-6">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Home
            </Link>
            <Link href="/store" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Shop
            </Link>
          </div>
        </div>

        <button
          onClick={openCart}
          className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Open cart"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-gray-900 text-white text-[10px] font-semibold w-4 h-4 rounded-full flex items-center justify-center leading-none">
              {count}
            </span>
          )}
        </button>
      </div>
    </nav>
  )
}
