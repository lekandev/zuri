import { createClient } from '@/lib/supabase/server'
import type { CartItem, Customer, PaystackVerifyResponse } from '@/types'

interface VerifyBody {
  reference: string
  cart: CartItem[]
  customer: Customer
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json() as Partial<VerifyBody>
    const { reference, cart, customer } = body

    if (!reference || !cart || !customer) {
      return Response.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const paystackData = await paystackRes.json() as PaystackVerifyResponse

    if (!paystackData.status || paystackData.data?.status !== 'success') {
      return Response.json({ success: false, error: 'Payment verification failed' }, { status: 400 })
    }

    const total = paystackData.data.amount / 100
    const deliveryAddress = [customer.address, customer.city, customer.state].filter(Boolean).join(', ')

    const supabase = await createClient()
    const { error } = await supabase.from('orders').insert({
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone || null,
      delivery_address: deliveryAddress || null,
      items: cart,
      total,
      paystack_ref: reference,
      source: 'paystack',
      status: 'paid',
    })

    if (error) {
      console.error('Order insert error:', error)
      return Response.json({ success: false, error: 'Could not save order' }, { status: 500 })
    }

    return Response.json({ success: true, total })
  } catch (err) {
    console.error('Paystack verify error:', err)
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
