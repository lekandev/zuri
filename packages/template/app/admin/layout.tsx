import { ReactNode } from 'react'

const storeName = process.env.NEXT_PUBLIC_STORE_NAME ?? 'My Store'

export const metadata = { title: `Admin — ${storeName}` }

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
