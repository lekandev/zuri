import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import TheDropClient from '@/components/TheDropClient'
import { createClient } from '@/lib/supabase/server'

const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'My Store'
const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''

const MARQUEE_ITEMS = [
  storeName, 'New Arrivals', 'Shop Now', 'Free Shipping',
  storeName, 'New Collection', 'Shop Now', storeName,
]

async function getFeaturedProducts() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('available', true)
      .eq('featured', true)
      .limit(4)
      .order('created_at', { ascending: false })
    return data || []
  } catch { return [] }
}

export default async function HomePage() {
  const featured = await getFeaturedProducts()

  return (
    <main>
      {/* Hero */}
      <section className="min-h-[80svh] flex flex-col items-center justify-center text-center px-4 py-20 bg-white">
        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-4">Welcome to</p>
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-gray-900 mb-5">{storeName}</h1>
        <p className="text-base text-gray-500 max-w-sm mb-10">
          Discover our curated collection — quality products, delivered to your door.
        </p>
        <Link
          href="/store"
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Shop Collection
        </Link>

        {featured.length > 0 && (
          <div className="mt-16 w-full max-w-3xl grid grid-cols-2 sm:grid-cols-4 gap-3">
            {featured.map((product) => (
              <div key={product.id} className="aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden shadow-sm">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Marquee */}
      <div className="overflow-hidden border-y border-gray-100 bg-white py-3">
        <div className="flex w-max animate-marquee" aria-hidden>
          {[...Array(2)].flatMap((_, copy) =>
            MARQUEE_ITEMS.map((t, i) => (
              <span
                key={`${copy}-${i}`}
                className="text-xs font-medium tracking-widest uppercase text-gray-400 px-8 border-r border-gray-100 last:border-r-0 whitespace-nowrap"
              >
                {t}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-2">Handpicked</p>
              <h2 className="text-3xl font-bold text-gray-900">New Arrivals</h2>
            </div>
            <Link
              href="/store"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="bg-white border-y border-gray-100 py-20 px-4">
        <div className="max-w-md mx-auto text-center">
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">Stay in the loop</p>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Be the first to know.</h2>
          <p className="text-sm text-gray-500 mb-8">
            Get notified about new arrivals and exclusive offers.
          </p>
          <TheDropClient />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <span className="font-bold text-base text-gray-900">{storeName}</span>
          <div className="flex gap-6">
            <Link href="/store" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
              Shop
            </Link>
            {waNumber && (
              <a
                href={`https://wa.me/${waNumber}`}
                className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
                target="_blank"
                rel="noopener"
              >
                WhatsApp
              </a>
            )}
          </div>
          <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} {storeName}</p>
        </div>
      </footer>
    </main>
  )
}
