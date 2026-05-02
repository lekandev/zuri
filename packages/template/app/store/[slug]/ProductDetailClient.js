'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/cart-context'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''
const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'My Store'
const currencySymbol = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₦'

export default function ProductDetailClient({ product }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState(null)
  const [added, setAdded] = useState(false)
  const { addItem, openCart } = useCart()

  const images = product.images || []
  const sizes = product.sizes || []

  function handleAddToCart() {
    if (sizes.length > 0 && !selectedSize) return
    addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      images: product.images,
      selectedSize: selectedSize || 'One size',
      slug: product.slug,
    })
    setAdded(true)
    setTimeout(() => { setAdded(false); openCart() }, 800)
  }

  function handleWhatsApp() {
    const msg = `Hi ${storeName}! I'd like to order:\n\n*${product.name}*${selectedSize ? `\nSize: ${selectedSize}` : ''}\nPrice: ${currencySymbol}${Number(product.price).toLocaleString()}\n\nIs this available?`
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <Link
        href="/store"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8"
      >
        ← Back to shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-start">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden">
            {images.length > 0 ? (
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-opacity duration-200"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-14 h-[72px] rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${
                    selectedImage === i ? 'border-gray-900' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-6 pt-2">
          <div>
            {product.category && (
              <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-2">
                {product.category}
              </p>
            )}
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-3">
              {product.name}
            </h1>
            <p className="text-2xl font-bold text-gray-900">
              {currencySymbol}{Number(product.price).toLocaleString()}
            </p>
          </div>

          {product.description && (
            <p className="text-sm leading-relaxed text-gray-500">{product.description}</p>
          )}

          {sizes.length > 0 && (
            <div>
              <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">
                Size{selectedSize && ` — ${selectedSize}`}
              </p>
              <div className="flex flex-wrap gap-2">
                {sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    disabled={!product.available}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all disabled:opacity-30 ${
                      selectedSize === size
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {product.available ? (
              <>
                <button
                  onClick={handleAddToCart}
                  disabled={sizes.length > 0 && !selectedSize}
                  className="w-full py-3.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  {added ? 'Added ✓' : sizes.length > 0 && !selectedSize ? 'Select a size' : 'Add to Cart'}
                </button>
                {WHATSAPP && (
                  <button
                    onClick={handleWhatsApp}
                    className="w-full py-3.5 bg-[#25D366] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <WhatsAppIcon />
                    Order via WhatsApp
                  </button>
                )}
              </>
            ) : (
              <>
                <button disabled className="w-full py-3.5 bg-gray-900 text-white rounded-xl text-sm font-semibold opacity-40">
                  Sold Out
                </button>
                {WHATSAPP && (
                  <button
                    onClick={handleWhatsApp}
                    className="w-full py-3.5 bg-[#25D366] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <WhatsAppIcon />
                    Ask about restock
                  </button>
                )}
              </>
            )}
          </div>

          <div className="border-t border-gray-100 pt-5 space-y-1">
            <details className="group">
              <summary className="flex justify-between items-center text-sm font-semibold cursor-pointer py-2 list-none">
                Care & Details
                <span className="text-gray-400 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <div className="pt-2 pb-3 text-sm text-gray-500 leading-loose space-y-0.5">
                <p>• Machine wash cold, gentle cycle</p>
                <p>• Do not tumble dry</p>
                <p>• Iron on low heat</p>
                <p>• Dry flat</p>
              </div>
            </details>
            <details className="group">
              <summary className="flex justify-between items-center text-sm font-semibold cursor-pointer py-2 list-none">
                Shipping
                <span className="text-gray-400 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <div className="pt-2 pb-3 text-sm text-gray-500 leading-loose space-y-0.5">
                <p>• Standard: 3–5 business days</p>
                <p>• Express: 1–2 business days</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </main>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}
