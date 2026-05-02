'use client'

import { useState, useEffect, useRef, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Product, Order, Subscriber, OrderStatus, ProductForm } from '@/types'

const storeName = process.env.NEXT_PUBLIC_STORE_NAME ?? 'My Store'
const currencySymbol = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL ?? '₦'

const SIZES_ALL = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const CATEGORIES = ['General', 'Shirts', 'Blouses', 'Tops', 'Sets', 'Pants', 'Shoes', 'Accessories', 'Other']

type AdminTab = 'products' | 'orders' | 'subscribers'

const STATUS_COLORS: Record<OrderStatus, React.CSSProperties> = {
  pending:    { background: '#fff3cd', color: '#856404' },
  paid:       { background: '#d4edda', color: '#155724' },
  processing: { background: '#e8d5f5', color: '#5b21b6' },
  shipped:    { background: '#cce5ff', color: '#004085' },
  delivered:  { background: '#d4edda', color: '#155724' },
  cancelled:  { background: '#f8d7da', color: '#721c24' },
}

function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 60)
}

const emptyForm: ProductForm = {
  name: '', slug: '', description: '', price: '',
  category: 'General', sizes: [],
  available: true, featured: false, images: [],
}

// ── Sub-components ───────────────────────────────────────────────

const inputClass = 'bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 transition-colors w-full'
const labelClass = 'text-xs font-medium text-gray-500 mb-1.5 block'

function TableHead({ cols }: { cols: string[] }) {
  return (
    <thead>
      <tr className="border-b border-gray-100">
        {cols.map(col => (
          <th key={col} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide bg-gray-50">
            {col}
          </th>
        ))}
      </tr>
    </thead>
  )
}

function EmptyRow({ cols, message }: { cols: number; message: string }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-12 text-center text-sm text-gray-400">{message}</td>
    </tr>
  )
}

// ── Main component ───────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()

  const [tab, setTab] = useState<AdminTab>('products')
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [panel, setPanel] = useState<string | null>(null) // null | 'add' | product.id
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploadingImg, setUploadingImg] = useState(false)
  const [msg, setMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetchProducts(); fetchOrders(); fetchSubscribers() }, [])

  async function fetchProducts() {
    setLoading(true)
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts((data as Product[]) ?? [])
    setLoading(false)
  }

  async function fetchOrders() {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    setOrders((data as Order[]) ?? [])
  }

  async function fetchSubscribers() {
    const { data } = await supabase.from('subscribers').select('*').order('created_at', { ascending: false })
    setSubscribers((data as Subscriber[]) ?? [])
  }

  function downloadSubscribersCSV() {
    const rows = [['Email', 'Signed Up'], ...subscribers.map(s => [s.email, new Date(s.created_at).toLocaleString()])]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `subscribers-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function openAdd() { setForm(emptyForm); setPanel('add'); setMsg('') }

  function openEdit(product: Product) {
    setForm({ ...product, price: String(product.price), sizes: product.sizes ?? [], images: product.images ?? [] })
    setPanel(product.id)
    setMsg('')
  }

  function closePanel() { setPanel(null); setMsg('') }

  function handleField<K extends keyof ProductForm>(key: K, value: ProductForm[K]) {
    setForm(prev => {
      const next = { ...prev, [key]: value }
      if (key === 'name' && panel === 'add') next.slug = slugify(value as string)
      return next
    })
  }

  function toggleSize(size: string) {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size],
    }))
  }

  async function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImg(true)
    const ext = file.name.split('.').pop()
    const path = `products/${Date.now()}.${ext}`
    const { data, error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true })
    if (error) { setMsg('Image upload failed.'); setUploadingImg(false); return }
    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(data.path)
    setForm(prev => ({ ...prev, images: [...prev.images, urlData.publicUrl] }))
    setUploadingImg(false)
  }

  function removeImage(idx: number) {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))
  }

  async function handleSave() {
    if (!form.name || !form.price || !form.slug) { setMsg('Name, price and slug are required.'); return }
    setSaving(true)
    setMsg('')
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price),
      category: form.category,
      sizes: form.sizes,
      images: form.images,
      available: form.available,
      featured: form.featured,
    }
    let error
    if (panel === 'add') {
      ;({ error } = await supabase.from('products').insert(payload))
    } else {
      ;({ error } = await supabase.from('products').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', panel!))
    }
    setSaving(false)
    if (error) { setMsg(`Error: ${error.message}`); return }
    setMsg(panel === 'add' ? 'Product added!' : 'Product updated!')
    fetchProducts()
    setTimeout(closePanel, 800)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this product?')) return
    await supabase.from('products').delete().eq('id', id)
    fetchProducts()
  }

  async function toggleAvailability(product: Product) {
    await supabase.from('products').update({ available: !product.available }).eq('id', product.id)
    fetchProducts()
  }

  async function handleOrderStatus(id: string, status: OrderStatus) {
    await supabase.from('orders').update({ status }).eq('id', id)
    fetchOrders()
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <div className="min-h-dvh bg-gray-50 font-sans">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 h-14 flex items-center justify-between">
        <span className="font-bold text-base text-gray-900">{storeName} — Admin</span>
        <div className="flex items-center gap-1">
          {(['products', 'orders', 'subscribers'] as AdminTab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tab === t ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
          <button
            onClick={handleSignOut}
            className="ml-2 px-3 py-1.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto">

        {/* Products */}
        {tab === 'products' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Products ({products.length})</h2>
              <button onClick={openAdd} className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity">
                + Add Product
              </button>
            </div>
            {loading ? (
              <p className="text-sm text-gray-400">Loading…</p>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full text-sm border-collapse">
                  <TableHead cols={['Product', 'Category', 'Price', 'Status', 'Actions']} />
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            {p.images?.[0] && (
                              <div className="w-10 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                                <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-gray-900">{p.name}</p>
                              <p className="text-xs text-gray-400">{p.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-gray-500">{p.category}</td>
                        <td className="px-4 py-3.5 font-semibold text-gray-900">
                          {currencySymbol}{Number(p.price).toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5">
                          <button onClick={() => toggleAvailability(p)} className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${p.available ? 'bg-green-500' : 'bg-red-400'}`} />
                            <span className="text-sm text-gray-600">{p.available ? 'Available' : 'Sold out'}</span>
                          </button>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex gap-3">
                            <button onClick={() => openEdit(p)} className="text-xs font-medium text-blue-500 hover:text-blue-700 transition-colors">Edit</button>
                            <button onClick={() => handleDelete(p.id)} className="text-xs font-medium text-red-400 hover:text-red-600 transition-colors">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && <EmptyRow cols={5} message="No products yet. Add your first one." />}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Orders */}
        {tab === 'orders' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Orders ({orders.length})</h2>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <table className="w-full text-sm border-collapse">
                <TableHead cols={['Customer', 'Source', 'Total', 'Status', 'Date']} />
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} onClick={() => setSelectedOrder(order)} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer">
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-gray-900">{order.customer_name ?? '—'}</p>
                        <p className="text-xs text-gray-400">{order.customer_email ?? '—'}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize" style={{
                          background: order.source === 'whatsapp' ? '#d4f7e2' : '#fce4ec',
                          color: order.source === 'whatsapp' ? '#1a6e3c' : '#9c0f3f',
                        }}>
                          {order.source}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-gray-900">{currencySymbol}{Number(order.total).toLocaleString()}</td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize" style={STATUS_COLORS[order.status]}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && <EmptyRow cols={5} message="No orders yet." />}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Subscribers */}
        {tab === 'subscribers' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Subscribers ({subscribers.length})</h2>
              <button
                onClick={downloadSubscribersCSV}
                disabled={subscribers.length === 0}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                Download CSV
              </button>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <table className="w-full text-sm border-collapse">
                <TableHead cols={['Email', 'Signed Up']} />
                <tbody>
                  {subscribers.map(s => (
                    <tr key={s.id} className="border-b border-gray-50">
                      <td className="px-4 py-3.5 font-medium text-gray-900">{s.email}</td>
                      <td className="px-4 py-3.5 text-xs text-gray-400">
                        {new Date(s.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                  {subscribers.length === 0 && <EmptyRow cols={2} message="No subscribers yet." />}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Order detail drawer */}
      {selectedOrder && (
        <>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setSelectedOrder(null)} />
          <div className="fixed top-0 right-0 h-dvh w-full sm:w-[420px] bg-gray-50 z-50 flex flex-col shadow-2xl animate-slide-in-right overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100 shrink-0">
              <h2 className="text-base font-semibold text-gray-900">Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors text-lg leading-none">×</button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="flex gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize" style={{ background: selectedOrder.source === 'whatsapp' ? '#d4f7e2' : '#fce4ec', color: selectedOrder.source === 'whatsapp' ? '#1a6e3c' : '#9c0f3f' }}>
                  {selectedOrder.source}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize" style={STATUS_COLORS[selectedOrder.status]}>
                  {selectedOrder.status}
                </span>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2.5">Customer</p>
                <p className="font-semibold text-gray-900 text-sm mb-0.5">{selectedOrder.customer_name ?? '—'}</p>
                {selectedOrder.customer_email && <p className="text-sm text-gray-500">{selectedOrder.customer_email}</p>}
                {selectedOrder.customer_phone && <p className="text-sm text-gray-500">{selectedOrder.customer_phone}</p>}
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2.5">Delivery Address</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {selectedOrder.delivery_address ?? <span className="text-gray-400">Not provided</span>}
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2.5">Items</p>
                <div className="flex flex-col gap-3">
                  {selectedOrder.items?.length > 0
                    ? selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-start text-sm">
                        <div>
                          <p className="font-semibold text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-400">
                            {item.selectedSize !== 'One size' && `Size: ${item.selectedSize} · `}Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900">{currencySymbol}{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))
                    : <p className="text-sm text-gray-400">No item details</p>
                  }
                </div>
                <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between text-sm font-bold text-gray-900">
                  <span>Total</span>
                  <span>{currencySymbol}{Number(selectedOrder.total).toLocaleString()}</span>
                </div>
              </div>

              {selectedOrder.paystack_ref && (
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Paystack Ref</p>
                  <p className="text-xs font-mono text-gray-700 break-all">{selectedOrder.paystack_ref}</p>
                </div>
              )}

              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2.5">Update Status</p>
                <select
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 text-gray-900 outline-none focus:border-gray-400 transition-colors"
                  value={selectedOrder.status}
                  onChange={async e => {
                    const status = e.target.value as OrderStatus
                    await handleOrderStatus(selectedOrder.id, status)
                    setSelectedOrder(prev => prev ? { ...prev, status } : null)
                  }}
                >
                  {(['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <p className="text-xs text-gray-400 text-center">
                {new Date(selectedOrder.created_at).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Product form panel */}
      {panel !== null && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-start justify-end p-4" onClick={e => { if (e.target === e.currentTarget) closePanel() }}>
          <div className="bg-gray-50 rounded-2xl w-full max-w-[480px] max-h-[calc(100dvh-2rem)] overflow-y-auto shadow-2xl animate-fade-up">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50 sticky top-0 z-10">
              <h2 className="text-base font-bold text-gray-900">{panel === 'add' ? 'Add Product' : 'Edit Product'}</h2>
              <button onClick={closePanel} className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-300 transition-colors text-lg leading-none">×</button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className={labelClass}>Product name *</label>
                <input className={inputClass} value={form.name} onChange={e => handleField('name', e.target.value)} placeholder="e.g. Classic Cotton Tee" />
              </div>
              <div>
                <label className={labelClass}>Slug *</label>
                <input className={inputClass} value={form.slug} onChange={e => handleField('slug', e.target.value)} placeholder="classic-cotton-tee" />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea className={`${inputClass} resize-vertical min-h-[80px]`} value={form.description} onChange={e => handleField('description', e.target.value)} placeholder="Short product description…" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Price ({currencySymbol}) *</label>
                  <input className={inputClass} type="number" value={form.price} onChange={e => handleField('price', e.target.value)} placeholder="5000" />
                </div>
                <div>
                  <label className={labelClass}>Category</label>
                  <select className={inputClass} value={form.category} onChange={e => handleField('category', e.target.value)}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Sizes (optional)</label>
                <div className="flex gap-2 flex-wrap mt-1">
                  {SIZES_ALL.map(s => (
                    <button key={s} type="button" onClick={() => toggleSize(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${form.sizes.includes(s) ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-6">
                {(['available', 'featured'] as const).map(key => (
                  <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                    <div onClick={() => handleField(key, !form[key])} className={`relative w-10 h-6 rounded-full transition-colors ${form[key] ? 'bg-green-500' : 'bg-gray-200'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form[key] ? 'translate-x-5' : 'translate-x-1'}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 capitalize">{key}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className={labelClass}>Product images</label>
                <div className="flex gap-2 flex-wrap mt-1 mb-2">
                  {form.images.map((img, i) => (
                    <div key={i} className="relative">
                      <img src={img} alt="" className="w-16 h-20 object-cover rounded-lg" />
                      <button onClick={() => removeImage(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center leading-none">×</button>
                    </div>
                  ))}
                </div>
                <input type="file" ref={fileRef} accept="image/*" onChange={handleImageUpload} className="hidden" />
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploadingImg}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40">
                  {uploadingImg ? 'Uploading…' : '+ Upload image'}
                </button>
              </div>

              {msg && (
                <p className={`text-sm font-medium text-center ${msg.startsWith('Error') ? 'text-red-500' : 'text-green-600'}`}>{msg}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button onClick={closePanel} className="flex-1 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-[2] py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40">
                  {saving ? 'Saving…' : panel === 'add' ? 'Add Product' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
