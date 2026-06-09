import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, X } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { promoCodes } from '../data/offers'
import { formatPrice, getGradientForProduct } from '../utils/helpers'
import styles from './CartPage.module.css'

export default function CartPage() {
  const { items, removeItem, updateQty, subtotal, packingTotal, addonsTotal, cartTotal } = useCart()
  const { isLoggedIn } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [promoCode, setPromoCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [promoApplied, setPromoApplied] = useState('')

  const applyPromo = () => {
    const code = promoCodes[promoCode.toUpperCase()]
    if (!code) {
      showToast('Invalid promo code', 'error')
      return
    }
    const disc = code.type === 'percent'
      ? Math.round(subtotal * code.discount / 100)
      : code.discount
    setDiscount(disc)
    setPromoApplied(promoCode.toUpperCase())
    showToast(`Promo code applied! You save ${formatPrice(disc)}`, 'success')
  }

  const grandTotal = cartTotal - discount

  const handleCheckout = () => {
    if (!isLoggedIn) {
      showToast('Please log in to place an order 🌸', 'info')
      navigate('/login', { state: { from: '/checkout' } })
      return
    }
    navigate('/checkout')
  }

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIllustration} />
        <h2>Your cart is empty 🌸</h2>
        <p>Discover our beautiful bouquets and find the perfect gift.</p>
        <Link to="/shop" className="btn-primary">Shop Now</Link>
      </div>
    )
  }

  return (
    <div className={styles.cart}>
      <div className="container">
        <h1 className={styles.title}>Your Cart</h1>
        <div className={styles.layout}>
          <div className={styles.items}>
            {items.map((item) => {
              const unitPrice = item.price ?? item.basePrice ?? 0
              const addonsSum = (item.addons || []).reduce((s, a) => s + a.price, 0)
              const lineTotal = (unitPrice + (item.packingCost || 0) + addonsSum) * item.quantity

              return (
                <div key={item.cartItemId || item.cartId} className={styles.item}>
                  <div
                    className={styles.itemImage}
                    style={{ background: getGradientForProduct(item.productId) }}
                  />
                  <div className={styles.itemDetails}>
                    <h3>{item.name}</h3>
                    <span className={styles.itemMeta}>Size: {item.sizeLabel || item.size} · {item.type || 'Natural'}</span>
                    <span className={styles.itemMeta}>Wrapping: {item.wrapping}</span>
                    {item.addons?.length > 0 && (
                      <span className={styles.itemMeta}>
                        Add-ons: {item.addons.map((a) => a.name).join(', ')}
                      </span>
                    )}
                    {item.giftMessage && (
                      <span className={styles.itemMeta}>Message: "{item.giftMessage}"</span>
                    )}
                    <div className={styles.qtyRow}>
                      <div className={styles.qtyStepper}>
                        <button onClick={() => updateQty(item.cartItemId || item.cartId, item.quantity - 1)} aria-label="Decrease">
                          <Minus size={14} />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQty(item.cartItemId || item.cartId, item.quantity + 1)} aria-label="Increase">
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className={styles.lineTotal}>{formatPrice(lineTotal)}</span>
                    </div>
                  </div>
                  <button className={styles.removeBtn} onClick={() => removeItem(item.cartItemId || item.cartId)} aria-label="Remove">
                    <X size={18} />
                  </button>
                </div>
              )
            })}
          </div>

          <div className={`glass-card ${styles.summary}`}>
            <h3>Order Summary</h3>
            <div className={styles.summaryRow}>
              <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Packing Total</span><span>{formatPrice(packingTotal)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Add-Ons Total</span><span>{formatPrice(addonsTotal)}</span>
            </div>

            <div className={styles.promoRow}>
              <input
                type="text"
                placeholder="Promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <button onClick={applyPromo}>Apply</button>
            </div>

            {discount > 0 && (
              <div className={`${styles.summaryRow} ${styles.discount}`}>
                <span>Discount ({promoApplied})</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}

            <p className={styles.shippingNote}>
              (Calculated at checkout based on location)
            </p>

            <div className={`${styles.summaryRow} ${styles.grandTotal}`}>
              <span>Grand Total</span>
              <strong>{formatPrice(grandTotal)}</strong>
            </div>

            <button className={`btn-primary ${styles.checkoutBtn}`} onClick={handleCheckout}>
              Proceed to Checkout
            </button>

            <div className={styles.paymentIcons}>
              <span className={styles.visa}>VISA</span>
              <span className={styles.mc}>Mastercard</span>
              <span className={styles.cod}>COD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
