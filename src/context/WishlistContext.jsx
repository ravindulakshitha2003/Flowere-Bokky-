import { createContext, useContext, useReducer, useEffect } from 'react'

const WishlistContext = createContext(null)

function normalizeItems(payload) {
  if (!Array.isArray(payload)) return []
  return payload.map((item) => {
    if (typeof item === 'string') {
      return {
        wishlistItemId: item,
        productId: item,
        name: 'Saved bouquet',
        price: 0,
        image: null,
        type: 'Natural Flowers',
      }
    }
    return {
      ...item,
      wishlistItemId: item.wishlistItemId || `${Date.now()}-${item.productId}`,
    }
  })
}

function wishlistReducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return normalizeItems(action.payload)
    case 'TOGGLE': {
      const snapshot = typeof action.payload === 'string'
        ? {
            productId: action.payload,
            wishlistItemId: action.payload,
            name: 'Saved bouquet',
            price: 0,
            image: null,
            type: 'Natural Flowers',
          }
        : action.payload
      const exists = state.find((i) => i.productId === snapshot.productId)
      if (exists) {
        return state.filter((i) => i.productId !== snapshot.productId)
      }
      return [
        ...state,
        {
          ...snapshot,
          wishlistItemId: snapshot.wishlistItemId || Date.now().toString(),
        },
      ]
    }
    case 'REMOVE':
      return state.filter((i) => i.productId !== action.payload)
    default:
      return state
  }
}

export function WishlistProvider({ children }) {
  const [items, dispatch] = useReducer(wishlistReducer, [])

  useEffect(() => {
    const stored = localStorage.getItem('bb_wishlist')
    if (stored) {
      try {
        dispatch({ type: 'LOAD', payload: JSON.parse(stored) })
      } catch {
        localStorage.removeItem('bb_wishlist')
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('bb_wishlist', JSON.stringify(items))
  }, [items])

  const toggle = (productSnapshot) => dispatch({ type: 'TOGGLE', payload: productSnapshot })
  const removeByProductId = (productId) => dispatch({ type: 'REMOVE', payload: productId })
  const isWishlisted = (productId) => items.some((i) => i.productId === productId)

  return (
    <WishlistContext.Provider
      value={{ items, toggle, removeByProductId, isWishlisted, count: items.length }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
