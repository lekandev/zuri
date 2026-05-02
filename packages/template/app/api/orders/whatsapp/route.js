import { createClient } from '@/lib/supabase/server'

export async function POST(request) {
  try {
    const { cart, customer } = await request.json()
    if (!cart || !customer) {
      return Response.json({ success: false }, { status: 400 })
    }

    const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const deliveryAddress = [customer.address, customer.city, customer.state].filter(Boolean).join(', ')

    const supabase = await createClient()
    const { error } = await supabase.from('orders').insert({
      customer_name: customer.name || null,
      customer_email: customer.email || null,
      customer_phone: customer.phone || null,
      delivery_address: deliveryAddress || null,
      items: cart,
      total,
      source: 'whatsapp',
      status: 'pending',
    })

    if (error) {
      console.error('WhatsApp order insert error:', error)
      return Response.json({ success: false }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error('WhatsApp order error:', err)
    return Response.json({ success: false }, { status: 500 })
  }
}
