import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request): Promise<Response> {
  try {
    const { email } = await request.json() as { email?: string }

    if (!email || !email.includes('@')) {
      return Response.json({ success: false, error: 'Invalid email' }, { status: 400 })
    }

    const supabase = await createClient()
    const { error } = await supabase
      .from('subscribers')
      .insert({ email: email.toLowerCase().trim() })

    if (error && !error.message.includes('duplicate')) {
      return Response.json({ success: false }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch {
    return Response.json({ success: false }, { status: 500 })
  }
}
