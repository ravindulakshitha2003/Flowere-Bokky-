import { createContext, useContext, useReducer, useEffect } from 'react'

const CartContext = createContext(null)

const initialState = { items: [] }

function addonsTotalForItem(addons = []) {
  return addons.reduce((sum, a) => sum + (a.price || 0), 0)
}

function linePrice(item) {
  return item.price ?? item.basePrice ?? 0
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return { items: action.payload }
    case 'ADD': {
      const snapshot = action.payload
      const existing = state.items.find(
        (i) =>
          i.productId === snapshot.productId &&
          i.size === snapshot.size &&
          i.wrapping === snapshot.wrapping &&
          JSON.stringify(i.addons || []) === JSON.stringify(snapshot.addons || [])
      )
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.cartItemId === existing.cartItemId
              ? { ...i, quantity: i.quantity + (snapshot.quantity || 1) }
              : i
          ),
        }
      }
      const cartItemId = snapshot.cartItemId || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      const newItem = {
        ...snapshot,
        cartItemId,
        cartId: cartItemId,
        quantity: snapshot.quantity || 1,
      }
      return { items: [...state.items, newItem] }
    }
    case 'REMOVE':
      return {
        items: state.items.filter(
          (i) => i.cartItemId !== action.payload && i.cartId !== action.payload
        ),
      }
    case 'UPDATE_QTY': {
      const id = action.payload.cartItemId ?? action.payload.cartId
      return {
        items: state.items.map((i) =>
          i.cartItemId === id || i.cartId === id
            ? { ...i, quantity: Math.max(1, action.payload.quantity) }
            : i
        ),
      }
    }
    case 'CLEAR':
      return { items: [] }
    default:
      return state
  }
}

function calcItemTotal(item) {
  return (linePrice(item) + (item.packingCost || 0) + addonsTotalForItem(item.addons)) * item.quantity
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  useEffect(() => {
    const stored = localStorage.getItem('bb_cart')
    if (stored) {
      try {
        const items = JSON.parse(stored).map((item) => ({
          ...item,
          cartItemId: item.cartItemId || item.cartId,
          cartId: item.cartId || item.cartItemId,
          price: item.price ?? item.basePrice,
        }))
        dispatch({ type: 'LOAD', payload: items })
      } catch {
        localStorage.removeItem('bb_cart')
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('bb_cart', JSON.stringify(state.items))
  }, [state.items])

  const addItem = (productSnapshot) => dispatch({ type: 'ADD', payload: productSnapshot })
  const removeItem = (cartItemId) => dispatch({ type: 'REMOVE', payload: cartItemId })
  const updateQty = (cartItemId, quantity) =>
    dispatch({ type: 'UPDATE_QTY', payload: { cartItemId, quantity } })
  const clearCart = () => dispatch({ type: 'CLEAR' })

  const cartTotal = state.items.reduce((sum, item) => sum + calcItemTotal(item), 0)
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)
  const packingTotal = state.items.reduce(
    (sum, item) => sum + (item.packingCost || 0) * item.quantity,
    0
  )
  const addonsTotal = state.items.reduce(
    (sum, item) => sum + addonsTotalForItem(item.addons) * item.quantity,
    0
  )
  const subtotal = state.items.reduce(
    (sum, item) => sum + linePrice(item) * item.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        cartTotal,
        itemCount,
        packingTotal,
        addonsTotal,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
