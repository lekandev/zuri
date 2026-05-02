'use client'

import { useState, FormEvent } from 'react'

export default function TheDropClient() {
  const [done, setDone] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    try {
      await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
    } catch {}
    setLoading(false)
    setDone(true)
  }

  if (done) {
    return (
      <p className="text-sm font-medium text-gray-900">
        You&apos;re on the list. We&apos;ll be in touch.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-sm mx-auto">
      <input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        className="flex-1 min-w-0 px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 transition-colors"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 shrink-0"
      >
        {loading ? '…' : 'Join'}
      </button>
    </form>
  )
}
