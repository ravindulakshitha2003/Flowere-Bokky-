// src/pages/CheckoutPage.jsx
import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { formatPrice, getMinDeliveryDate } from '../utils/helpers'
import styles from './CheckoutPage.module.css'

const API_BASE = 'http://localhost:3000'
const STEPS = ['Delivery', 'Payment', 'Confirm']
const SIZE_RANK = { S: 1, M: 2, L: 3 }
const SIZE_LABELS = { S: 'Small', M: 'Medium', L: 'Large' }

// Local delivery config — replace with a fetch to your API if/when you have
// a real delivery-zones endpoint. No context/store dependency for now.
const DELIVERY_ZONE = {
  id: 'zone-colombo-metro',
  name: 'Colombo 01-15',
  priceSmall: 400,
  priceMedium: 550,
  priceLarge: 700,
  // Default center used until a real draggable-pin map is wired up.
  defaultLat: 6.9271,
  defaultLng: 79.8612,
}
const DELIVERY_SLOTS = [
  { id: 'slot-morning', label: 'Morning', time: '8AM - 12PM', icon: '🌅', active: true },
  { id: 'slot-afternoon', label: 'Afternoon', time: '12PM - 4PM', icon: '☀️', active: true },
  { id: 'slot-eve-02', label: 'Evening Express', time: '16:00 - 19:00', icon: '🌇', active: true },
]
const DELIVERY_RULES = {
  advanceBookingDays: 1,
  sameDayDelivery: false,
  blockSundays: true,
  freeDeliveryThreshold: 15000,
}
const GIFT_WRAP_COST = 200

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

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    return null
  }
}

export default function CheckoutPage() {
  const { items, cartTotal, packingTotal, clearCart } = useCart()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const user = getStoredUser()
  const promoFromCart = location.state?.promoCode || ''
  const discountFromCart = location.state?.discount || 0

  const activeSlots = useMemo(
    () => DELIVERY_SLOTS.filter((s) => s.active),
    []
  )

  const minDeliveryDate = useMemo(() => {
    const advance = DELIVERY_RULES.advanceBookingDays > 0
      ? DELIVERY_RULES.advanceBookingDays
      : 0
    const base = DELIVERY_RULES.sameDayDelivery ? Math.max(0, advance - 1) : advance
    return getMinDeliveryDate(base)
  }, [])

  // Redirect guard: token must exist to be here at all (ProtectedRoute
  // already checks this, but this covers direct state loss / stale cart)
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      showToast('Please log in to place an order 🌸', 'info')
      navigate('/login', { state: { from: '/checkout' }, replace: true })
    }
  }, [navigate, showToast])

  const [step, setStep] = useState(0)
  const [placing, setPlacing] = useState(false)
  const [confirmedOrder, setConfirmedOrder] = useState(null) // full order object returned by the server
  const [pinLocation, setPinLocation] = useState(null) // { lat, lng } once the user places the pin
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    slot: 'slot-eve-02',
    date: '',
    giftWrapping: false,
    paymentMethod: 'card',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    pinPlaced: false,
  })

  const selectedZone = DELIVERY_ZONE
  const largestSize = useMemo(() => getLargestCartSize(items), [items])

  const subtotal = cartTotal + packingTotal
  const baseShipping = form.pinPlaced
    ? getZonePriceForSize(selectedZone, largestSize)
    : 0
  const shippingCost = (
    DELIVERY_RULES.freeDeliveryThreshold > 0
    && subtotal >= DELIVERY_RULES.freeDeliveryThreshold
  ) ? 0 : baseShipping
  const giftWrappingCost = form.giftWrapping ? GIFT_WRAP_COST : 0
  const total = Math.max(0, subtotal + shippingCost + giftWrappingCost - discountFromCart)

  const updateForm = (key, value) => {
    if (key === 'date' && DELIVERY_RULES.blockSundays && value) {
      const day = new Date(`${value}T12:00:00`).getDay()
      if (day === 0) return
    }
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const effectiveDate = form.date || minDeliveryDate
  const selectedSlot = activeSlots.find((s) => s.id === form.slot)

  const addonsTotalAll = items.reduce(
    (sum, i) => sum + (i.addons || []).reduce((s, a) => s + (a.price || 0), 0) * i.quantity,
    0
  )

  // NOTE: orderId, payment.status and payment.transactionId are intentionally
  // NOT sent — the server is the source of truth for all three. Sending them
  // from the client would let anyone forge a "paid" order.
  function buildOrderPayload() {
    return {
      customer: {
        userId: user?.id ?? user?._id ?? null,
        name: form.name,
        phone: form.phone,
        email: form.email,
      },
      items: items.map((it) => {
        const unitPrice = it.price ?? it.basePrice ?? 0
        const addons = (it.addons || []).map((a) => ({
          addonId: a.addonId ?? a.id,
          name: a.name,
          price: a.price,
          category: a.category ?? null,
        }))
        const addonsSum = addons.reduce((s, a) => s + a.price, 0)
        return {
          productId: it.productId,
          name: it.name,
          type: it.type ?? null,
          image: it.image ?? null,
          size: it.size,
          sizeLabel: it.sizeLabel,
          flowers: it.flowers ?? null,
          unitPrice,
          originalPrice: it.originalPrice ?? unitPrice,
          isOffer: !!it.isOffer,
          offerDiscount: it.offerDiscount ?? 0,
          packingCost: it.packingCost ?? 0,
          packingMaterial: it.packingMaterial ?? null,
          quality: it.quality ?? null,
          weight: it.weight ?? null,
          colors: it.colors ?? [],
          flowerList: it.flowerList ?? [],
          wrapping: it.wrapping,
          surpriseMe: !!it.surpriseMe,
          addons,
          addonsTotal: addonsSum * it.quantity,
          giftMessage: it.giftMessage ?? '',
          quantity: it.quantity,
          lineTotal: (unitPrice + (it.packingCost || 0) + addonsSum) * it.quantity,
        }
      }),
      delivery: {
        address: form.address,
        location: pinLocation ?? {
          lat: selectedZone.defaultLat,
          lng: selectedZone.defaultLng,
        },
        zoneId: selectedZone.id,
        zoneName: selectedZone.name,
        slotId: form.slot,
        slotLabel: selectedSlot?.label ?? null,
        slotTime: selectedSlot?.time ?? null,
        date: effectiveDate,
        giftWrapping: form.giftWrapping,
        giftWrappingCost,
      },
      payment: {
        method: form.paymentMethod,
        cardLast4: form.paymentMethod === 'card'
          ? form.cardNumber.replace(/\s/g, '').slice(-4)
          : null,
      },
      pricing: {
        subtotal: cartTotal,
        packingTotal,
        addonsTotal: addonsTotalAll,
        giftWrappingCost,
        shippingCost,
        discount: discountFromCart,
        promoCode: promoFromCart || null,
        total,
        currency: 'LKR',
      },
    }
  }

  const handlePlaceOrder = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login', { state: { from: '/checkout' } })
      return
    }

    const payload = buildOrderPayload()

    try {
      setPlacing(true)
      const res = await fetch(`http://localhost:3000/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (res.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        showToast('Session expired, please log in again', 'error')
        navigate('/login', { state: { from: '/checkout' } })
        return
      }

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.message || `Order failed (${res.status})`)
      }

      if (!data.order) {
        throw new Error('Order response was missing expected data')
      }

      // Store exactly what the server saved — this is what the confirmation
      // screen renders, so it can never drift from the database record.
      setConfirmedOrder(data.order)
      clearCart()
      setStep(2)
    } catch (err) {
      if (err instanceof TypeError) {
        showToast('Cannot reach the server. Is the backend running?', 'error')
      } else {
        showToast(err.message || 'Could not place your order', 'error')
      }
    } finally {
      setPlacing(false)
    }
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
                onClick={() => {
                  // NOTE: this iframe embed can't report a dragged pin's
                  // coordinates back to React (iframes are sandboxed). Until
                  // this is swapped for the Google Maps JS API with a
                  // draggable marker + onDragEnd handler, we fall back to the
                  // zone's default coordinates in buildOrderPayload().
                  setPinLocation({ lat: selectedZone.defaultLat, lng: selectedZone.defaultLng })
                  updateForm('pinPlaced', true)
                }}
              >
                {form.pinPlaced ? '✓ Pin Placed' : 'Place Delivery Pin'}
              </button>
            </div>

            {form.pinPlaced && (
              <p className={styles.zoneLabel}>
                {selectedZone.name} — {SIZE_LABELS[largestSize]} bouquet — {formatPrice(shippingCost)} delivery fee
                {DELIVERY_RULES.freeDeliveryThreshold > 0 && subtotal >= DELIVERY_RULES.freeDeliveryThreshold && ' (free delivery applied)'}
              </p>
            )}

            {DELIVERY_RULES.sameDayDelivery && (
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
              {DELIVERY_RULES.blockSundays && (
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
              Premium gift wrapping (+LKR {GIFT_WRAP_COST})
            </label>

            <button
              className="btn-primary"
              onClick={() => setStep(1)}
              disabled={!form.name || !form.phone || !form.address || !form.pinPlaced}
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
              {form.pinPlaced && (
                <p className={styles.zoneLabel}>
                  Shipping ({SIZE_LABELS[largestSize]}): {formatPrice(shippingCost)}
                </p>
              )}
              {discountFromCart > 0 && (
                <p className={styles.zoneLabel}>Discount ({promoFromCart}): -{formatPrice(discountFromCart)}</p>
              )}
            </div>

            <button
              className={`btn-primary ${styles.placeOrder}`}
              onClick={handlePlaceOrder}
              disabled={placing}
            >
              {placing ? 'Placing order…' : 'Place Order'}
            </button>
          </div>
        )}

        {/* Step 3: Confirmation — everything here reads from confirmedOrder,
            i.e. exactly what the server persisted, never local form state. */}
        {step === 2 && confirmedOrder && (
          <div className={styles.confirmation}>
            <div className={styles.successIcon}>
              <svg viewBox="0 0 52 52" className={styles.checkmark}>
                <circle cx="26" cy="26" r="25" fill="none" className={styles.checkCircle} />
                <path fill="none" d="M14 27l7 7 16-16" className={styles.checkPath} />
              </svg>
            </div>
            <h2>Order Confirmed!</h2>
            <p className={styles.orderIdLabel}>Order ID</p>
            <p className={styles.orderId}>{confirmedOrder.orderId}</p>

            <div className={styles.confirmSummary}>
              <h3>Order Summary</h3>
              {confirmedOrder.items?.length > 0 && (
                <div className={styles.confirmItems}>
                  {confirmedOrder.items.map((item, i) => (
                    <div key={i} className={styles.confirmItem}>
                      <span>{item.name} ({item.size}) × {item.quantity}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className={styles.summaryGrid}>
                <div><span>Delivery Address</span><strong>{confirmedOrder.delivery?.address}</strong></div>
                <div><span>Delivery Slot</span><strong>{confirmedOrder.delivery?.slotLabel} ({confirmedOrder.delivery?.slotTime})</strong></div>
                <div><span>Delivery Date</span><strong>{confirmedOrder.delivery?.date}</strong></div>
                <div><span>Packing Cost</span><strong>{formatPrice(confirmedOrder.pricing?.packingTotal)}</strong></div>
                <div><span>Shipping</span><strong>{formatPrice(confirmedOrder.pricing?.shippingCost)}</strong></div>
                <div><span>Gift Wrapping</span><strong>{formatPrice(confirmedOrder.pricing?.giftWrappingCost)}</strong></div>
                <div>
                  <span>Payment</span>
                  <strong>
                    {confirmedOrder.payment?.method === 'card' ? 'Card' : 'Cash on Delivery'}
                    {confirmedOrder.payment?.method === 'card' && confirmedOrder.payment?.cardLast4
                      ? ` •••• ${confirmedOrder.payment.cardLast4}`
                      : ''}
                    {' — '}
                    {confirmedOrder.payment?.status}
                  </strong>
                </div>
                <div><span>Order Status</span><strong>{confirmedOrder.status}</strong></div>
                <div className={styles.totalRow}><span>Total</span><strong>{formatPrice(confirmedOrder.pricing?.total)}</strong></div>
              </div>
            </div>

            <p className={styles.trackingLink}>
              Track your order: <Link to={`/track/${confirmedOrder.orderId}`}>bloomandbliss.lk/track/{confirmedOrder.orderId}</Link>
            </p>

            <div className={styles.confirmActions}>
              <Link to={`/track/${confirmedOrder.orderId}`} className="btn-primary">Track Your Order</Link>
              <Link to="/shop" className="btn-outline">Continue Shopping</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}