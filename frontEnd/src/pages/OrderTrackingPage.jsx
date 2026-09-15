import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { getOrderById, mockOrders } from '../data/orders'
import { formatPrice } from '../utils/helpers'
import styles from './OrderTrackingPage.module.css'

const STEP_LABELS = [
  'Order Confirmed',
  'Being Crafted',
  'Ready for Pickup',
  'Out for Delivery',
  'Delivered',
]

export default function OrderTrackingPage() {
  const { orderId: paramId } = useParams()
  const [searchId, setSearchId] = useState(paramId || '')
  const [order, setOrder] = useState(paramId ? getOrderById(paramId) : null)
  const [searched, setSearched] = useState(!!paramId)

  const handleSearch = (e) => {
    e.preventDefault()
    const found = getOrderById(searchId.toUpperCase())
    setOrder(found || null)
    setSearched(true)
  }

  return (
    <div className={styles.tracking}>
      <div className="container">
        <h1 className={styles.title}>Track Your Order</h1>
        <p className={styles.subtitle}>Enter your order ID to see real-time delivery status</p>

        <form className={styles.searchForm} onSubmit={handleSearch}>
          <div className={styles.searchInput}>
            <Search size={20} />
            <input
              type="text"
              placeholder="e.g. ORD-2847"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary">Track</button>
        </form>

        <p className={styles.hint}>
          Try: {mockOrders.map((o) => o.id).join(', ')}
        </p>

        {searched && !order && (
          <div className={styles.notFound}>
            <p>Order not found. Please check your order ID and try again.</p>
          </div>
        )}

        {order && (
          <div className={styles.result}>
            <div className={styles.eta}>
              <span>Estimated Delivery</span>
              <strong>{order.estimatedDelivery}</strong>
            </div>

            <div className={styles.progressBar}>
              {STEP_LABELS.map((label, i) => (
                <div
                  key={label}
                  className={`${styles.step} ${i <= order.currentStep ? styles.stepDone : ''} ${i === order.currentStep ? styles.stepCurrent : ''}`}
                >
                  <div className={styles.stepIcon}>
                    {order.steps[i]?.icon || (i <= order.currentStep ? '✅' : '○')}
                  </div>
                  <div className={styles.stepInfo}>
                    <strong>{label}</strong>
                    {order.steps[i]?.timestamp && (
                      <span className={styles.timestamp}>{order.steps[i].timestamp}</span>
                    )}
                    {order.steps[i]?.note && (
                      <span className={styles.note}>{order.steps[i].note}</span>
                    )}
                  </div>
                  {i < STEP_LABELS.length - 1 && <div className={styles.connector} />}
                </div>
              ))}
            </div>

            <div className={`glass-card ${styles.summaryCard}`}>
              <h3>Order Summary</h3>
              <div className={styles.summaryGrid}>
                <div><span>Order ID</span><strong>{order.id}</strong></div>
                <div><span>Customer</span><strong>{order.customer}</strong></div>
                <div><span>Product</span><strong>{order.product} ({order.size})</strong></div>
                <div><span>Status</span><strong className={styles.statusBadge}>{order.status}</strong></div>
                <div><span>Total</span><strong>{formatPrice(order.total)}</strong></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
