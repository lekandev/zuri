import { ReactNode } from 'react'
import './globals.css'
import { CartProvider } from '@/lib/cart-context'
import Navbar from '@/components/Navbar'
import CartDrawer from '@/components/CartDrawer'

const storeName = process.env.NEXT_PUBLIC_STORE_NAME ?? 'My Store'

export const metadata = {
  title: storeName,
  description: `Shop ${storeName}`,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-gray-50 text-gray-900 antialiased font-sans">
        <CartProvider>
          <Navbar />
          <CartDrawer />
          {children}
        </CartProvider>
      </body>
    </html>
  )
}
