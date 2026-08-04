import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../context/StoreContext'
import { formatPrice, generateOrderId, getMinDeliveryDate } from '../utils/helpers'
import styles from './CheckoutPage.module.css'

const STEPS = ['Delivery', 'Payment', 'Confirm']
const SIZE_RANK = { S: 1, M: 2, L: 3 }
const SIZE_LABELS = { S: 'Small', M: 'Medium', L: 'Large' }

function getLargestCartSize(cartItems) {
  let largest = 'S'
  cartItems.forEach((item) => {
    if ((SIZE_RANK[item.size] || 1) > (SIZE_RANK[largest] || 1)) {
      largest = item.size
    }
  })
  return largest
}

function getZonePriceForSize(zone, size) {
  if (!zone) return 0
  if (size === 'L') return zone.priceLarge ?? zone.price ?? 0
  if (size === 'M') return zone.priceMedium ?? zone.price ?? 0
  return zone.priceSmall ?? zone.price ?? 0
}

export default function CheckoutPage() {
  const { items, cartTotal, packingTotal, clearCart } = useCart()
  const { user } = useAuth()
  const { deliveryZones, deliverySlots, deliveryRules } = useStore()

  const activeSlots = useMemo(
    () => deliverySlots.filter((s) => s.active),
    [deliverySlots]
  )

  const minDeliveryDate = useMemo(() => {
    const advance = deliveryRules.advanceBookingDays > 0
      ? deliveryRules.advanceBookingDays
      : 0
    const base = deliveryRules.sameDayDelivery ? Math.max(0, advance - 1) : advance
    return getMinDeliveryDate(base)
  }, [deliveryRules])

  const [step, setStep] = useState(0)
  const [orderId, setOrderId] = useState('')
  const [orderSnapshot, setOrderSnapshot] = useState(null)
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    slot: 'morning',
    date: '',
    giftWrapping: false,
    paymentMethod: 'card',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    pinPlaced: false,
  })

  const selectedZone = useMemo(
    () => deliveryZones.find((z) => z.active) || deliveryZones[0],
    [deliveryZones]
  )

  const largestSize = useMemo(() => getLargestCartSize(items), [items])

  const subtotal = cartTotal + packingTotal
  const baseShipping = form.pinPlaced && selectedZone
    ? getZonePriceForSize(selectedZone, largestSize)
    : 0
  const shippingCost = (
    deliveryRules.freeDeliveryThreshold > 0
    && subtotal >= deliveryRules.freeDeliveryThreshold
  ) ? 0 : baseShipping
  const total = subtotal + shippingCost

  const updateForm = (key, value) => {
    if (key === 'date' && deliveryRules.blockSundays && value) {
      const day = new Date(`${value}T12:00:00`).getDay()
      if (day === 0) return
    }
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const effectiveDate = form.date || minDeliveryDate
  const selectedSlot = activeSlots.find((s) => s.id === form.slot)

  const handlePlaceOrder = async () => {
    await new Promise((r) => setTimeout(r, 1200))
    const id = generateOrderId()
    setOrderSnapshot({
      items: [...items],
      cartTotal,
      packingTotal,
      shippingCost,
      total,
    })
    setOrderId(id)
    clearCart()
    setStep(2)
  }

  if (items.length === 0 && step < 2) {
    return (
      <div className={styles.empty}>
        <h2>Nothing to checkout</h2>
        <Link to="/shop" className="btn-primary">Continue Shopping</Link>
      </div>
    )
  }

  return (
    <div className={styles.checkout}>
      <div className="container">
        <h1 className={styles.title}>Checkout</h1>

        {/* Step Indicator */}
        <div className={styles.steps}>
          {STEPS.map((s, i) => (
            <div key={s} className={`${styles.stepItem} ${i <= step ? styles.stepActive : ''} ${i < step ? styles.stepDone : ''}`}>
              <span className={styles.stepNum}>{i < step ? '✓' : i + 1}</span>
              <span>{s}</span>
              {i < STEPS.length - 1 && <div className={styles.stepLine} />}
            </div>
          ))}
        </div>

        {/* Step 1: Delivery */}
        {step === 0 && (
          <div className={styles.stepContent}>
            <h2>Delivery Details</h2>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label>Full Name</label>
                <input value={form.name} onChange={(e) => updateForm('name', e.target.value)} required />
              </div>
              <div className={styles.field}>
                <label>Phone</label>
                <input value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} required />
              </div>
              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label>Email</label>
                <input type="email" value={form.email} onChange={(e) => updateForm('email', e.target.value)} required />
              </div>
              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label>Delivery Address</label>
                <textarea value={form.address} onChange={(e) => updateForm('address', e.target.value)} rows={3} required />
              </div>
            </div>

            <div className={styles.mapPlaceholder}>
              <iframe
                title="Delivery location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d253840.63903210647!2d79.808053!3d6.927079!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae253d10f7a7003%3A0xbbfdbdc0c879c169!2sColombo!5e0!3m2!1sen!2slk!4v1700000000000"
                width="100%"
                height="250"
                style={{ border: 0, borderRadius: '12px' }}
                allowFullScreen
                loading="lazy"
              />
              <p className={styles.mapLabel}>Drag pin to your exact door/gate</p>
              <button
                className={styles.pinBtn}
                onClick={() => updateForm('pinPlaced', true)}
              >
                {form.pinPlaced ? '✓ Pin Placed' : 'Place Delivery Pin'}
              </button>
            </div>

            {form.pinPlaced && selectedZone && (
              <p className={styles.zoneLabel}>
                {selectedZone.name} — {SIZE_LABELS[largestSize]} bouquet — {formatPrice(shippingCost)} delivery fee
                {deliveryRules.freeDeliveryThreshold > 0 && subtotal >= deliveryRules.freeDeliveryThreshold && ' (free delivery applied)'}
              </p>
            )}

            {deliveryRules.sameDayDelivery && (
              <p className={styles.zoneLabel}>Same-day delivery available for qualifying orders</p>
            )}

            <div className={styles.slots}>
              <h3>Delivery Slot</h3>
              <div className={styles.slotGrid}>
                {activeSlots.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`${styles.slotCard} ${form.slot === s.id ? styles.slotActive : ''}`}
                    onClick={() => updateForm('slot', s.id)}
                  >
                    <strong>{s.icon} {s.label}</strong>
                    <span>{s.time}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label>Delivery Date</label>
              <input
                type="date"
                value={effectiveDate}
                min={minDeliveryDate}
                onChange={(e) => updateForm('date', e.target.value)}
              />
              {deliveryRules.blockSundays && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sundays are not available for delivery</span>
              )}
            </div>

            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={form.giftWrapping}
                onChange={(e) => updateForm('giftWrapping', e.target.checked)}
              />
              <span className={styles.toggleSlider} />
              Premium gift wrapping (+LKR 200)
            </label>

            <button
              className="btn-primary"
              onClick={() => setStep(1)}
              disabled={!form.name || !form.phone || !form.address}
            >
              Continue to Payment
            </button>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 1 && (
          <div className={styles.stepContent}>
            <h2>Payment Method</h2>
            <div className={styles.paymentCards}>
              <button
                className={`${styles.paymentCard} ${form.paymentMethod === 'card' ? styles.paymentActive : ''}`}
                onClick={() => updateForm('paymentMethod', 'card')}
              >
                <span className={styles.paymentIcon}>💳</span>
                <strong>Pay by Card</strong>
                <span>Visa, Mastercard</span>
              </button>
              <button
                className={`${styles.paymentCard} ${form.paymentMethod === 'cod' ? styles.paymentActive : ''}`}
                onClick={() => updateForm('paymentMethod', 'cod')}
              >
                <span className={styles.paymentIcon}>💵</span>
                <strong>Cash on Delivery</strong>
                <span>Pay when your bouquet arrives</span>
              </button>
            </div>

            {form.paymentMethod === 'card' && (
              <div className={styles.cardForm}>
                <div className={styles.field}>
                  <label>Card Number</label>
                  <input
                    placeholder="1234 5678 9012 3456"
                    value={form.cardNumber}
                    onChange={(e) => updateForm('cardNumber', e.target.value)}
                  />
                </div>
                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label>Expiry</label>
                    <input placeholder="MM/YY" value={form.cardExpiry} onChange={(e) => updateForm('cardExpiry', e.target.value)} />
                  </div>
                  <div className={styles.field}>
                    <label>CVV</label>
                    <input placeholder="123" value={form.cardCvv} onChange={(e) => updateForm('cardCvv', e.target.value)} />
                  </div>
                </div>
                <p className={styles.sslBadge}>🔒 Secured by 256-bit SSL</p>
              </div>
            )}

            {form.paymentMethod === 'cod' && (
              <div className={styles.codNote}>
                <p>Pay when your bouquet arrives at your doorstep. Please keep exact change ready if possible.</p>
                <p className={styles.codConfirm}>A confirmation SMS will be sent to {form.phone}</p>
              </div>
            )}

            <div className={styles.orderPreview}>
              <h3>Order Total: {formatPrice(total)}</h3>
              {form.pinPlaced && selectedZone && (
                <p className={styles.zoneLabel}>
                  Shipping ({SIZE_LABELS[largestSize]}): {formatPrice(shippingCost)}
                </p>
              )}
            </div>

            <button className={`btn-primary ${styles.placeOrder}`} onClick={handlePlaceOrder}>
              Place Order
            </button>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 2 && (
          <div className={styles.confirmation}>
            <div className={styles.successIcon}>
              <svg viewBox="0 0 52 52" className={styles.checkmark}>
                <circle cx="26" cy="26" r="25" fill="none" className={styles.checkCircle} />
                <path fill="none" d="M14 27l7 7 16-16" className={styles.checkPath} />
              </svg>
            </div>
            <h2>Order Confirmed!</h2>
            <p className={styles.orderIdLabel}>Order ID</p>
            <p className={styles.orderId}>{orderId}</p>

            <div className={styles.confirmSummary}>
              <h3>Order Summary</h3>
              {orderSnapshot?.items?.length > 0 && (
                <div className={styles.confirmItems}>
                  {orderSnapshot.items.map((item) => (
                    <div key={item.cartId} className={styles.confirmItem}>
                      <span>{item.name} ({item.size}) × {item.quantity}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className={styles.summaryGrid}>
                <div><span>Delivery Address</span><strong>{form.address}</strong></div>
                <div><span>Delivery Slot</span><strong>{selectedSlot?.label} ({selectedSlot?.time})</strong></div>
                <div><span>Delivery Date</span><strong>{effectiveDate}</strong></div>
                <div><span>Packing Cost</span><strong>{formatPrice(orderSnapshot?.packingTotal ?? packingTotal)}</strong></div>
                <div><span>Shipping</span><strong>{formatPrice(orderSnapshot?.shippingCost ?? shippingCost)}</strong></div>
                <div><span>Payment</span><strong>{form.paymentMethod === 'card' ? 'Card' : 'Cash on Delivery'}</strong></div>
                <div className={styles.totalRow}><span>Total</span><strong>{formatPrice(orderSnapshot?.total ?? total)}</strong></div>
              </div>
            </div>

            <p className={styles.trackingLink}>
              Track your order: <Link to={`/track/${orderId}`}>bloomandbliss.lk/track/{orderId}</Link>
            </p>

            <div className={styles.confirmActions}>
              <Link to={`/track/${orderId}`} className="btn-primary">Track Your Order</Link>
              <Link to="/shop" className="btn-outline">Continue Shopping</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
