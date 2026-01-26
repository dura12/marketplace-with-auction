
"use client"

import { createContext, useContext, useState, useEffect } from "react"

const CartContext = createContext()
const STORAGE_KEY = (email) => `cart_${email || 'guest'}`

export function CartProvider({ children, userEmail }) {
  const [cart, setCart] = useState({ merchants: [] })

  // Load cart for this user (or guest) on mount
  useEffect(() => {
    const key = STORAGE_KEY(userEmail)
    const saved = localStorage.getItem(key)
    if (saved) {
      setCart(JSON.parse(saved))
    }

    // Optional: merge guest cart into user cart on login
    if (userEmail) {
      const guestKey = STORAGE_KEY(null)
      const guestCart = localStorage.getItem(guestKey)
      if (guestCart) {
        try {
          const parsedGuest = JSON.parse(guestCart)
          // Merge guestCart.merchants into current user cart
          setCart(prev => {
            const merged = { ...prev }
            parsedGuest.merchants.forEach(gMerchant => {
              const idx = merged.merchants.findIndex(m => m.merchantId === gMerchant.merchantId)
              if (idx === -1) {
                merged.merchants.push(gMerchant)
              } else {
                gMerchant.products.forEach(gProd => {
                  const pIdx = merged.merchants[idx].products.findIndex(p => p.id === gProd.id)
                  if (pIdx === -1) {
                    merged.merchants[idx].products.push(gProd)
                  } else {
                    merged.merchants[idx].products[pIdx].quantity += gProd.quantity
                  }
                })
              }
            })
            return merged
          })
        } catch {}
        localStorage.removeItem(guestKey)
      }
    }
  }, [userEmail])

  // Persist cart under namespaced key whenever it changes
  useEffect(() => {
    const key = STORAGE_KEY(userEmail)
    localStorage.setItem(key, JSON.stringify(cart))
  }, [cart, userEmail])

  const addToCart = (product) => {
    setCart(prev => {
      const merchantIndex = prev.merchants.findIndex(
        m => m.merchantId === product.merchantId
      )

      if (merchantIndex === -1) {
        return {
          ...prev,
          merchants: [
            ...prev.merchants,
            { merchantId: product.merchantId, merchantName: product.merchantName, products: [product] }
          ]
        }
      }

      return {
        ...prev,
        merchants: prev.merchants.map((m, i) => i !== merchantIndex ? m : {
          ...m,
          products: m.products.some(p => p.id === product.id)
            ? m.products.map(p => p.id === product.id ? { ...p, quantity: p.quantity + product.quantity } : p)
            : [...m.products, product]
        })
      }
    })
  }

  const removeProduct = (merchantId, productId) => {
    setCart(prev => ({
      ...prev,
      merchants: prev.merchants
        .map(m => m.merchantId === merchantId ? { ...m, products: m.products.filter(p => p.id !== productId) } : m)
        .filter(m => m.products.length > 0)
    }))
  }

  const clearMerchant = (merchantId) => {
    setCart(prev => ({
      ...prev,
      merchants: prev.merchants.filter(m => m.merchantId !== merchantId)
    }))
  }
  const clearCart = () => {
    setCart({ merchants: [] })
  }

  const updateQuantity = (merchantId, productId, newQuantity) => {
    if (newQuantity === 0) {
      removeProduct(merchantId, productId)
      return
    }
    setCart(prev => ({
      ...prev,
      merchants: prev.merchants.map(m => m.merchantId !== merchantId ? m : {
        ...m,
        products: m.products.map(p => p.id === productId ? { ...p, quantity: newQuantity } : p)
      })
    }))
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeProduct, clearMerchant, clearCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
