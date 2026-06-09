import { useState, useMemo } from 'react'
import { useToast } from '../context/ToastContext'
import styles from './CustomOrdersPanel.module.css'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'ready', label: 'Ready for Pickup' },
  { value: 'delivered', label: 'Delivered' },
]

const FILTER_MAP = {
  all: () => true,
  pending: (o) => o.status === 'pending',
  'in-progress': (o) => o.status === 'in-progress',
  ready: (o) => o.status === 'ready' || o.status === 'completed',
  completed: (o) => o.status === 'delivered' || o.status === 'completed',
}

function hasCustomizations(order) {
  const hasMessage = Boolean(order.giftMessage?.trim())
  const hasAddons = Array.isArray(order.addons) && order.addons.length > 0
  const hasCustomWrap = order.wrapping && !['Standard', 'Blush Pink', 'Ivory Silk'].includes(order.wrapping)
  return hasMessage || hasAddons || hasCustomWrap
}

function daysRemaining(deadline) {
  const diff = new Date(deadline) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function PrintSheet({ order, onClose }) {
  return (
    <div className={styles.printOverlay}>
      <div className={styles.printToolbar}>
        <button type="button" className="btn-primary" onClick={() => window.print()}>Print</button>
        <button type="button" className="btn-outline" onClick={onClose}>Close</button>
      </div>
      <div className={styles.printSheet} id="custom-order-print">
        <header className={styles.printHeader}>
          <h1>Bloom &amp; Bliss — Florist Order Sheet</h1>
          <p>Order {order.id} · {new Date(order.createdAt).toLocaleDateString('en-LK')}</p>
        </header>

        <section className={styles.printSection}>
          <h2>Customer</h2>
          <p><strong>{order.customer}</strong></p>
          <p>Phone: {order.phone || '—'}</p>
        </section>

        <section className={styles.printSection}>
          <h2>Bouquet Details</h2>
          <p><strong>{order.product}</strong></p>
          <p>Size: {order.sizeLabel || order.size} · Qty: {order.quantity || 1}</p>
          {order.wrapping && <p>Wrapping: {order.wrapping}</p>}
          {order.addons?.length > 0 && (
            <p>Add-ons: {order.addons.map((a) => a.name || a).join(', ')}</p>
          )}
        </section>

        {order.giftMessage?.trim() && (
          <section className={`${styles.printSection} ${styles.printGiftBox}`}>
            <h2>💌 Gift Message</h2>
            <p className={styles.printGiftText}>&ldquo;{order.giftMessage}&rdquo;</p>
          </section>
        )}

        <section className={styles.printSection}>
          <h2>Delivery</h2>
          <p>Address: {order.address || 'See order notes'}</p>
          <p>Slot: {order.deliverySlot || 'Morning'}</p>
          <p>Date: {order.deliveryDate || new Date(order.deadline).toLocaleDateString('en-LK')}</p>
        </section>

        <section className={styles.printSection}>
          <h2>Florist Notes</h2>
          <div className={styles.noteLines}>
            <span /><span /><span /><span />
          </div>
        </section>
      </div>
    </div>
  )
}

export default function CustomOrdersPanel({ orders, setOrders, onMarkComplete }) {
  const { showToast } = useToast()
  const [filter, setFilter] = useState('all')
  const [printOrder, setPrintOrder] = useState(null)

  const customOrders = useMemo(
    () => orders.filter(hasCustomizations),
    [orders]
  )

  const filtered = useMemo(() => {
    const fn = FILTER_MAP[filter] || FILTER_MAP.all
    return customOrders
      .filter(fn)
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
  }, [customOrders, filter])

  const updateStatus = (orderId, status) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)))
    showToast('Order status updated', 'info')
  }

  const markComplete = (orderId) => {
    if (onMarkComplete) {
      onMarkComplete(orderId)
    } else {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: 'completed' } : o)))
      showToast(`Order ${orderId} marked complete`, 'success')
    }
  }

  return (
    <div className={styles.panel}>
      <h1>🎨 Custom Orders</h1>
      <p className={styles.subtitle}>Orders with gift messages, add-ons, or custom wrapping</p>

      <div className={styles.filterBar}>
        {['all', 'pending', 'in-progress', 'ready', 'completed'].map((f) => (
          <button
            key={f}
            type="button"
            className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f === 'in-progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <span className={styles.sortHint}>Sorted by deadline (nearest first)</span>
      </div>

      {filtered.length === 0 ? (
        <p className={styles.empty}>No custom orders match this filter.</p>
      ) : (
        <div className={styles.cardGrid}>
          {filtered.map((order) => {
            const days = daysRemaining(order.deadline)
            return (
              <article key={order.id} className={styles.card}>
                <header className={styles.cardHeader}>
                  <div>
                    <strong>{order.id}</strong>
                    {order.giftMessage?.trim() && (
                      <span className={styles.giftBadge} title="Has gift message">💌</span>
                    )}
                    <span className={styles.cardDue}>
                      Due: {new Date(order.deadline).toLocaleDateString('en-LK', {
                        month: 'long', day: 'numeric', year: 'numeric',
                      })}
                    </span>
                  </div>
                  {days <= 2 && days >= 0 && (
                    <span className={styles.daysLeft}>⚠️ {days === 0 ? 'Due today' : `${days} day${days > 1 ? 's' : ''} remaining`}</span>
                  )}
                  {days < 0 && <span className={styles.overdue}>⚠️ Overdue</span>}
                </header>

                <div className={styles.cardSection}>
                  <p><strong>Customer:</strong> {order.customer}</p>
                  <p><strong>Phone:</strong> {order.phone || '—'}</p>
                </div>

                <div className={styles.cardSection}>
                  <p>🌸 {order.product}</p>
                  <p>Size: {order.sizeLabel || order.size} · Qty: {order.quantity || 1}</p>
                  {order.wrapping && <p>Wrapping: {order.wrapping}</p>}
                  {order.addons?.length > 0 && (
                    <p>Add-ons: {order.addons.map((a) => a.name || a).join(', ')}</p>
                  )}
                  {order.giftMessage?.trim() && (
                    <div className={styles.giftPreview}>
                      <span>💌 Gift message:</span>
                      <p>&ldquo;{order.giftMessage}&rdquo;</p>
                    </div>
                  )}
                </div>

                <footer className={styles.cardFooter}>
                  <label className={styles.statusSelect}>
                    Status:
                    <select
                      value={order.status === 'completed' ? 'ready' : order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </label>
                  <div className={styles.cardActions}>
                    <button type="button" className="btn-primary" onClick={() => markComplete(order.id)}>
                      ✅ Mark Complete
                    </button>
                    <button type="button" className="btn-outline" onClick={() => setPrintOrder(order)}>
                      🖨️ Print Sheet
                    </button>
                  </div>
                </footer>
              </article>
            )
          })}
        </div>
      )}

      {printOrder && (
        <PrintSheet order={printOrder} onClose={() => setPrintOrder(null)} />
      )}
    </div>
  )
}
