import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'
import type { PaystackWebhookEvent } from '@/types'

export async function POST(request: Request): Promise<Response> {
  const body = await request.text()
  const signature = request.headers.get('x-paystack-signature')

  const expected = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
    .update(body)
    .digest('hex')

  if (signature !== expected) {
    return new Response('Unauthorized', { status: 401 })
  }

  const event = JSON.parse(body) as PaystackWebhookEvent

  if (event.event === 'charge.success') {
    const { data } = event
    const meta = data.metadata ?? {}
    const supabase = await createClient()

    // Skip if the inline verify already recorded this order
    const { data: existing } = await supabase
      .from('orders')
      .select('id')
      .eq('paystack_ref', data.reference)
      .maybeSingle()

    if (!existing) {
      await supabase.from('orders').insert({
        customer_name: meta.customer_name ?? data.customer?.first_name ?? null,
        customer_email: data.customer?.email ?? null,
        customer_phone: meta.customer_phone ?? data.customer?.phone ?? null,
        delivery_address: [meta.delivery_address, meta.delivery_city, meta.delivery_state].filter(Boolean).join(', ') || null,
        items: meta.cart ?? [],
        total: data.amount / 100,
        paystack_ref: data.reference,
        source: 'paystack',
        status: 'paid',
      })
    }
  }

  return new Response('OK', { status: 200 })
}
