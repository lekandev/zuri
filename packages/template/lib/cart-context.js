'use client'

import { createContext, useContext, useReducer, useEffect, useState } from 'react'

const CartContext = createContext(null)

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(
        i => i.id === action.item.id && i.selectedSize === action.item.selectedSize
      )
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.id === action.item.id && i.selectedSize === action.item.selectedSize
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        }
      }
      return { ...state, items: [...state.items, { ...action.item, quantity: 1 }] }
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(
          i => !(i.id === action.id && i.selectedSize === action.selectedSize)
        ),
      }
    case 'UPDATE_QUANTITY':
      if (action.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(
            i => !(i.id === action.id && i.selectedSize === action.selectedSize)
          ),
        }
      }
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.id && i.selectedSize === action.selectedSize
            ? { ...i, quantity: action.quantity }
            : i
        ),
      }
    case 'CLEAR':
      return { ...state, items: [] }
    case 'SET_ITEMS':
      return { ...state, items: action.items }
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })
  const [isOpen, setIsOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('zuri_cart')
      if (saved) dispatch({ type: 'SET_ITEMS', items: JSON.parse(saved) })
    } catch {}
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem('zuri_cart', JSON.stringify(state.items))
    } catch {}
  }, [state.items, hydrated])

  const total = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const count = state.items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        total,
        count,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addItem: (item) => dispatch({ type: 'ADD_ITEM', item }),
        removeItem: (id, selectedSize) => dispatch({ type: 'REMOVE_ITEM', id, selectedSize }),
        updateQuantity: (id, selectedSize, quantity) =>
          dispatch({ type: 'UPDATE_QUANTITY', id, selectedSize, quantity }),
        clearCart: () => dispatch({ type: 'CLEAR' }),
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
