'use client'

import { useState } from 'react'
import { useCart } from '@/lib/cart-context'

const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'My Store'
const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''
const currencySymbol = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₦'

export default function CartDrawer() {
  const { items, total, isOpen, closeCart, removeItem, updateQuantity, clearCart } = useCart()
  const [step, setStep] = useState('cart') // cart | checkout | success
  const [loading, setLoading] = useState(false)
  const [customer, setCustomer] = useState({
    name: '', email: '', phone: '', address: '', city: '', state: '',
  })

  async function handleWhatsAppOrder() {
    const lines = items
      .map(i => `• ${i.name}${i.selectedSize !== 'One size' ? ` (${i.selectedSize})` : ''} x${i.quantity} — ${currencySymbol}${(i.price * i.quantity).toLocaleString()}`)
      .join('\n')
    const addr = [customer.address, customer.city, customer.state].filter(Boolean).join(', ')
    const msg = `Hi ${storeName}! I'd like to place an order:\n\n${lines}\n\nTotal: ${currencySymbol}${total.toLocaleString()}\n\nName: ${customer.name || '—'}\nPhone: ${customer.phone || '—'}\nAddress: ${addr || '—'}\n\nPlease let me know how to proceed!`

    fetch('/api/orders/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart: items, customer }),
    }).catch(() => {})

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  async function handlePaystack() {
    if (!customer.name || !customer.email) return
    setLoading(true)
    const ref = `order_${Date.now()}`

    const PaystackPop = (await import('@paystack/inline-js')).default
    const popup = new PaystackPop()
    popup.newTransaction({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: customer.email,
      amount: Math.round(total * 100),
      currency: 'NGN',
      ref,
      metadata: {
        customer_name: customer.name,
        customer_phone: customer.phone,
        delivery_address: customer.address,
        delivery_city: customer.city,
        delivery_state: customer.state,
        cart: items,
      },
      onSuccess: async (transaction) => {
        try {
          const res = await fetch('/api/paystack/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reference: transaction.reference, cart: items, customer }),
          })
          const data = await res.json()
          if (data.success) { clearCart(); setStep('success') }
        } catch {}
        setLoading(false)
      },
      onCancel: () => setLoading(false),
    })
  }

  const inputClass =
    'bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 transition-colors w-full'

  function Field({ label, ...props }) {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-500">{label}</label>
        <input className={inputClass} {...props} />
      </div>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ${
          isOpen ? 'bg-black/20 backdrop-blur-sm pointer-events-auto' : 'bg-transparent pointer-events-none'
        }`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-dvh w-full sm:w-[420px] bg-gray-50 z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100 shrink-0">
          <h2 className="text-base font-semibold text-gray-900">
            {step === 'success' ? 'Order Confirmed' : 'Your Cart'}
          </h2>
          <button
            onClick={closeCart}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors leading-none text-lg"
            aria-label="Close cart"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">

          {step === 'success' ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center text-2xl">
                ✓
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Order placed!</h3>
              <p className="text-sm text-gray-500">We&apos;ll reach out to confirm your details.</p>
              <button
                className="mt-2 w-full py-3.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
                onClick={() => { setStep('cart'); closeCart() }}
              >
                Keep Shopping
              </button>
            </div>

          ) : step === 'checkout' ? (
            <div className="flex flex-col gap-4">
              <button
                onClick={() => setStep('cart')}
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors self-start"
              >
                ← Back
              </button>
              <h3 className="text-base font-semibold text-gray-900">Checkout</h3>

              <Field
                label="Name"
                type="text"
                placeholder="Your full name"
                value={customer.name}
                onChange={e => setCustomer(p => ({ ...p, name: e.target.value }))}
              />
              <Field
                label="Email"
                type="email"
                placeholder="your@email.com"
                value={customer.email}
                onChange={e => setCustomer(p => ({ ...p, email: e.target.value }))}
              />
              <Field
                label="Phone (optional)"
                type="tel"
                placeholder="+234..."
                value={customer.phone}
                onChange={e => setCustomer(p => ({ ...p, phone: e.target.value }))}
              />
              <Field
                label="Delivery address"
                type="text"
                placeholder="Street address"
                value={customer.address}
                onChange={e => setCustomer(p => ({ ...p, address: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="City"
                  type="text"
                  placeholder="City"
                  value={customer.city}
                  onChange={e => setCustomer(p => ({ ...p, city: e.target.value }))}
                />
                <Field
                  label="State"
                  type="text"
                  placeholder="State"
                  value={customer.state}
                  onChange={e => setCustomer(p => ({ ...p, state: e.target.value }))}
                />
              </div>

              <div className="flex justify-between items-center py-3.5 border-t border-gray-200 text-sm font-semibold mt-1">
                <span>Total</span>
                <span>{currencySymbol}{total.toLocaleString()}</span>
              </div>

              <button
                onClick={handlePaystack}
                disabled={loading || !customer.name || !customer.email || !customer.address || !customer.city}
                className="w-full py-3.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {loading ? 'Processing…' : `Pay ${currencySymbol}${total.toLocaleString()}`}
              </button>

              {whatsappNumber && (
                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full py-3.5 bg-[#25D366] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <WhatsAppIcon />
                  Order via WhatsApp instead
                </button>
              )}
            </div>

          ) : items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
              <p className="text-sm text-gray-400">Your cart is empty.</p>
              <button
                onClick={closeCart}
                className="text-sm font-medium text-gray-700 underline underline-offset-2 hover:text-gray-900 transition-colors"
              >
                Browse the shop
              </button>
            </div>

          ) : (
            <>
              <div className="flex flex-col gap-3 mb-4">
                {items.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}`} className="flex gap-3 p-3.5 bg-white rounded-xl border border-gray-100">
                    {item.images?.[0] && (
                      <div className="w-16 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                        <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 mb-0.5 truncate">{item.name}</p>
                      {item.selectedSize !== 'One size' && (
                        <p className="text-xs text-gray-400 mb-2">Size: {item.selectedSize}</p>
                      )}
                      <div className="flex items-center gap-2 bg-gray-100 rounded-full px-1 py-0.5 w-fit">
                        <button
                          onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                          className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-base hover:bg-gray-200 transition-colors leading-none"
                        >
                          −
                        </button>
                        <span className="text-sm font-medium min-w-[1rem] text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                          className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-base hover:bg-gray-200 transition-colors leading-none"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-sm font-semibold">
                        {currencySymbol}{(item.price * item.quantity).toLocaleString()}
                      </span>
                      <button
                        onClick={() => removeItem(item.id, item.selectedSize)}
                        className="text-gray-300 hover:text-red-400 transition-colors text-xl leading-none"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center py-4 border-t border-gray-200 text-sm font-semibold mb-3">
                <span>Total</span>
                <span>{currencySymbol}{total.toLocaleString()}</span>
              </div>

              <button
                onClick={() => setStep('checkout')}
                className="w-full py-3.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity mb-3"
              >
                Checkout
              </button>

              {whatsappNumber && (
                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full py-3.5 bg-[#25D366] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <WhatsAppIcon />
                  Order via WhatsApp
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}
