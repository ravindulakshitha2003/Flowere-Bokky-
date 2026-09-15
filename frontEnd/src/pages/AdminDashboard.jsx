import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, Flower2, Tag, Menu, X, BarChart2, Image, Truck, Sparkles, Palette,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { mockOrders } from '../data/orders'
import { useAuth } from '../context/AuthContext'

import ProductsPanel from '../admin/ProductsPanel'
import InventoryPanel from '../admin/InventoryPanel'
import GalleryPanel from '../admin/GalleryPanel'
import DeliveryPanel from '../admin/DeliveryPanel'
import CustomOrdersPanel from '../admin/CustomOrdersPanel'
import ConfirmModal from '../admin/ConfirmModal'
import { useFestival } from '../context/FestivalContext'
import { useToast } from '../context/ToastContext'
import { formatPrice } from '../utils/helpers'
import ThemeToggle from '../components/ui/ThemeToggle'
import styles from './AdminDashboard.module.css'

const FESTIVAL_OPTIONS = [
  { value: 'christmas', label: '❄️ Snow', toast: '❄️ Christmas mode activated!' },
  { value: 'rain', label: '🌧️ Rain', toast: '🌧️ Rain mode activated!' },
  { value: 'default', label: '🌸 Petals', toast: '🌸 Petal mode activated!' },
  { value: 'valentines', label: "♥ Valentine's", toast: "♥ Valentine's mode activated!" },
  { value: 'off', label: '⭕ Off', toast: 'Festival effects turned off' },
]

const NAV_ITEMS = [
  { id: 'dashboard', label: '📊 Overview', icon: LayoutDashboard },
  { id: 'orders', label: '📋 Orders', icon: Package },
  { id: 'custom', label: '🎨 Custom Orders', icon: Palette },
  { id: 'products', label: '🌸 Products', icon: Flower2 },
  { id: 'inventory', label: '📦 Inventory', icon: BarChart2 },
  { id: 'gallery', label: '🖼️ Gallery', icon: Image },
  { id: 'delivery', label: '🚚 Delivery', icon: Truck },
  { id: 'offers', label: '🏷️ Offers', icon: Tag },
  { id: 'festival', label: '🎄 Festival', icon: Sparkles },
]

const SALES_DATA = [
  { day: 'Mon', revenue: 12500 },
  { day: 'Tue', revenue: 18200 },
  { day: 'Wed', revenue: 9800 },
  { day: 'Thu', revenue: 22400 },
  { day: 'Fri', revenue: 31000 },
  { day: 'Sat', revenue: 28500 },
  { day: 'Sun', revenue: 15200 },
]

const STATUS_FLOW = ['pending', 'in-progress', 'completed', 'delivered']

const ORDER_EXTRAS = {
  'ORD-2956': {
    phone: '077 234 5678',
    giftMessage: 'Happy Birthday Amma! Love you so much 🌸',
    wrapping: 'Kraft Natural',
    addons: [{ name: 'LED Lighting' }, { name: 'Butterfly Decoration' }],
    sizeLabel: 'Small',
    quantity: 1,
    address: '12 Flower Road, Colombo 7',
    deliverySlot: 'Morning',
  },
  'ORD-3102': {
    phone: '077 345 6789',
    wrapping: 'Gold Foil',
    addons: [{ name: 'Fairy Lights' }],
    sizeLabel: 'Large',
    quantity: 1,
  },
  'ORD-2847': {
    phone: '077 123 4567',
    giftMessage: 'Congratulations on your anniversary!',
    wrapping: 'Blush Pink',
    addons: [],
  },
}

function loadCompletedIds() {
  try {
    return JSON.parse(localStorage.getItem('bb_completed_orders') || '[]')
  } catch {
    return []
  }
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
  )
}

function isDueToday(deadline) {
  return isSameDay(new Date(deadline), new Date())
}

function isDueTomorrow(deadline) {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return isSameDay(new Date(deadline), tomorrow)
}

function isOverdueOrder(order) {
  if (order.status === 'completed' || order.status === 'delivered') return false
  const now = new Date()
  const dl = new Date(order.deadline)
  return dl < now && !isDueToday(order.deadline)
}

function isOrderDone(order, completedIds) {
  return completedIds.includes(order.id) || order.status === 'completed' || order.status === 'delivered'
}

function enrichOrders(base, completedIds) {
  return base.map((o) => ({
    ...o,
    ...ORDER_EXTRAS[o.id],
    status: completedIds.includes(o.id) ? 'completed' : o.status,
  }))
}

function GiftMessageBox({ message }) {
  if (!message?.trim()) return null
  return (
    <div className={styles.giftMessageBox}>
      <strong>💌 Gift Message</strong>
      <p>&ldquo;{message}&rdquo;</p>
    </div>
  )
}

export default function AdminDashboard() {
  const [activePanel, setActivePanel] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [completedIds, setCompletedIds] = useState(loadCompletedIds)
  const [orders, setOrders] = useState(() => enrichOrders(mockOrders, loadCompletedIds()))
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [giftPopover, setGiftPopover] = useState(null)
  const [detailOrder, setDetailOrder] = useState(null)
  
  const [offers, setOffers] = useState(
    () => products.filter((p) => p.isOffer).map((p) => ({
      id: p.id,
      name: p.name,
      discount: p.offerDiscount,
      active: true,
    }))
  )
  const [newOffer, setNewOffer] = useState({ productId: '', discount: 10, start: '', end: '' })
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const { festivalMode, setFestivalMode } = useFestival()
  const { showToast } = useToast()

  useEffect(() => {
    localStorage.setItem('bb_completed_orders', JSON.stringify(completedIds))
  }, [completedIds])

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  const handleFestivalChange = (option) => {
    setFestivalMode(option.value)
    showToast(option.toast, option.value === 'off' ? 'info' : 'success')
  }

  const markOrderDone = (orderId) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: 'completed' } : o)))
    setCompletedIds((prev) => (prev.includes(orderId) ? prev : [...prev, orderId]))
    showToast(`Order ${orderId} marked complete`, 'success')
  }

  const todayPanelOrders = useMemo(() => {
    return orders
      .filter((o) => isDueToday(o.deadline) || isOverdueOrder(o))
      .sort((a, b) => {
        const aDone = isOrderDone(a, completedIds)
        const bDone = isOrderDone(b, completedIds)
        if (aDone !== bDone) return aDone ? 1 : -1
        return new Date(a.deadline) - new Date(b.deadline)
      })
  }, [orders, completedIds])

  const dueTodayCount = useMemo(
    () => orders.filter((o) => isDueToday(o.deadline) && !isOrderDone(o, completedIds)).length,
    [orders, completedIds]
  )

  const dueTomorrowCount = useMemo(
    () => orders.filter((o) => isDueTomorrow(o.deadline) && !isOrderDone(o, completedIds)).length,
    [orders, completedIds]
  )

  const allTodayComplete = todayPanelOrders.length > 0
    && todayPanelOrders.every((o) => isOrderDone(o, completedIds))

  const todayRevenue = 31000
  const pendingOrders = orders.filter((o) => o.status === 'pending').length
  const lowStock = products.flatMap((p) =>
    Object.values(p.sizes || {}).filter((s) => (s.stock ?? 0) < 5)
  ).length

  const handleResetDemoData = () => {
    localStorage.removeItem('bb_products')
    localStorage.removeItem('bb_gallery')
    localStorage.removeItem('bb_zones')
    localStorage.removeItem('bb_slots')
    localStorage.removeItem('bb_rules')
    localStorage.removeItem('bb_completed_orders')
    window.location.reload()
  }

  const updateOrderStatus = (orderId) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o
        const idx = STATUS_FLOW.indexOf(o.status)
        const nextStatus = idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : o.status
        return { ...o, status: nextStatus }
      })
    )
  }

  return (
    <div className={styles.admin}>
      {dueTodayCount > 0 && !allTodayComplete && (
        <div className={styles.urgentBanner}>
          🔴 {dueTodayCount} order{dueTodayCount !== 1 ? 's' : ''} due TODAY — act now!
        </div>
      )}
      {dueTodayCount === 0 && dueTomorrowCount > 0 && !allTodayComplete && (
        <div className={styles.amberBanner}>
          🟡 {dueTomorrowCount} order{dueTomorrowCount !== 1 ? 's' : ''} due tomorrow
        </div>
      )}
      {allTodayComplete && todayPanelOrders.length > 0 && (
        <div className={styles.successBanner}>
          ✅ All today&apos;s orders complete! 🌸
        </div>
      )}

      <button className={styles.mobileToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <h2 className={styles.sidebarLogo}>Bloom & Bliss</h2>
        <span className={styles.adminBadge}>Admin Panel</span>
        <nav className={styles.sidebarNav}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`${styles.navItem} ${activePanel === item.id ? styles.navActive : ''}`}
              onClick={() => { setActivePanel(item.id); setSidebarOpen(false) }}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.adminInfo}>
            <div className={styles.adminAvatar}>{user?.name?.charAt(0) || 'A'}</div>
            <div className={styles.adminDetails}>
              <span className={styles.adminName}>{user?.name || 'Admin'}</span>
              <span className={styles.adminEmail}>{user?.email || ''}</span>
            </div>
          </div>
          <div className={styles.sidebarActions}>
            <ThemeToggle />
            <button type="button" className={styles.logoutButton} onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className={styles.resetBtn}
          >
            🔄 Reset Demo Data
          </button>
        </div>
      </aside>

      {showResetConfirm && (
        <ConfirmModal
          message="This will reset all products, gallery, and delivery data to the original demo data. Are you sure?"
          onConfirm={handleResetDemoData}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}

      <main className={styles.main}>
        {activePanel === 'dashboard' && (
          <>
            <h1>Dashboard Overview</h1>
            <div className={styles.statGrid}>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Today&apos;s Orders</span>
                <span className={styles.statValue}>{orders.length}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Revenue</span>
                <span className={styles.statValue}>{formatPrice(todayRevenue)}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Pending Orders</span>
                <span className={styles.statValue}>{pendingOrders}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Low Stock Items</span>
                <span className={`${styles.statValue} ${lowStock > 0 ? styles.warning : ''}`}>{lowStock}</span>
              </div>
            </div>

            <div className={styles.todayPanel}>
              <h3>Today&apos;s Orders</h3>
              {todayPanelOrders.length === 0 ? (
                <p className={styles.todayEmpty}>No orders due today or overdue.</p>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Bouquet</th>
                      <th>Deadline</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayPanelOrders.map((o) => {
                      const done = isOrderDone(o, completedIds)
                      const overdue = isOverdueOrder(o) && !done
                      return (
                        <tr
                          key={o.id}
                          className={`${done ? styles.rowDone : ''} ${overdue ? styles.rowOverdue : ''}`}
                        >
                          <td>
                            {o.id}
                            {o.giftMessage?.trim() && <span title="Gift message"> 💌</span>}
                          </td>
                          <td>{o.customer}</td>
                          <td>{o.product} ({o.sizeLabel || o.size})</td>
                          <td>{new Date(o.deadline).toLocaleString('en-LK', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</td>
                          <td>
                            {overdue ? (
                              <span className={styles.overdueBadge}>⚠️ OVERDUE</span>
                            ) : (
                              <span className={styles.statusBadge}>{done ? 'completed' : o.status}</span>
                            )}
                          </td>
                          <td>
                            {!done && (
                              <button type="button" className={styles.actionBtn} onClick={() => markOrderDone(o.id)}>
                                ✅ Mark Done
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div className={styles.chartSection}>
              <h3>Weekly Revenue</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={SALES_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--petal)" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => formatPrice(v)} />
                  <Bar dataKey="revenue" fill="var(--rose-deep)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.recentOrders}>
              <h3>Recent Orders</h3>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Total</th>
                    <th>💌</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 10).map((o) => (
                    <tr key={o.id}>
                      <td>{o.id}</td>
                      <td>{o.customer}</td>
                      <td>{o.product}</td>
                      <td>{formatPrice(o.total)}</td>
                      <td>
                        {o.giftMessage?.trim() ? (
                          <button
                            type="button"
                            className={styles.giftIconBtn}
                            onClick={() => setGiftPopover(giftPopover === o.id ? null : o.id)}
                          >
                            💌
                          </button>
                        ) : null}
                        {giftPopover === o.id && (
                          <div className={styles.giftPopover}>&ldquo;{o.giftMessage}&rdquo;</div>
                        )}
                      </td>
                      <td><span className={styles.statusBadge}>{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activePanel === 'orders' && (
          <>
            <h1>Orders Management</h1>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Deadline</th>
                  <th>💌</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className={isOverdueOrder(o) ? styles.overdueRow : ''}>
                    <td>{o.id}</td>
                    <td>{o.customer}</td>
                    <td>{o.product}</td>
                    <td>{new Date(o.deadline).toLocaleDateString('en-LK')}</td>
                    <td>
                      {o.giftMessage?.trim() ? (
                        <button
                          type="button"
                          className={styles.giftIconBtn}
                          onClick={() => setGiftPopover(giftPopover === o.id ? null : o.id)}
                        >
                          💌
                        </button>
                      ) : null}
                      {giftPopover === o.id && (
                        <div className={styles.giftPopover}>&ldquo;{o.giftMessage}&rdquo;</div>
                      )}
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${o.status === 'delivered' ? styles.completed : ''}`}>
                        {o.status === 'delivered' ? '✓ ' : ''}{o.status}
                      </span>
                    </td>
                    <td>{formatPrice(o.total)}</td>
                    <td>
                      <button type="button" className={styles.linkBtn} onClick={() => setDetailOrder(o)}>
                        View Details
                      </button>
                      <button
                        className={styles.actionBtn}
                        onClick={() => updateOrderStatus(o.id)}
                        disabled={o.status === 'delivered'}
                      >
                        Advance Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {activePanel === 'custom' && (
          <CustomOrdersPanel orders={orders} setOrders={setOrders} onMarkComplete={markOrderDone} />
        )}

        {activePanel === 'products' && <ProductsPanel />}
        {activePanel === 'inventory' && <InventoryPanel />}
        {activePanel === 'gallery' && <GalleryPanel />}
        {activePanel === 'delivery' && <DeliveryPanel />}

        {activePanel === 'offers' && (
          <>
            <h1>🏷️ Offer Manager</h1>
            <div className={styles.offerForm}>
              <h3>Create New Offer</h3>
              <div className={styles.offerFormGrid}>
                <select value={newOffer.productId} onChange={(e) => setNewOffer((p) => ({ ...p, productId: e.target.value }))}>
                  <option value="">Select Product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <input type="number" placeholder="Discount %" value={newOffer.discount} onChange={(e) => setNewOffer((p) => ({ ...p, discount: e.target.value }))} />
                <input type="date" value={newOffer.start} onChange={(e) => setNewOffer((p) => ({ ...p, start: e.target.value }))} />
                <input type="date" value={newOffer.end} onChange={(e) => setNewOffer((p) => ({ ...p, end: e.target.value }))} />
                <button
                  className="btn-primary"
                  onClick={() => {
                    if (!newOffer.productId) return
                    const product = products.find((p) => p.id === newOffer.productId)
                    setOffers((prev) => [...prev, { id: newOffer.productId, name: product.name, discount: newOffer.discount, active: true }])
                    setNewOffer({ productId: '', discount: 10, start: '', end: '' })
                  }}
                >
                  Create Offer
                </button>
              </div>
            </div>
            <h3>Active Offers</h3>
            <div className={styles.offersList}>
              {offers.map((offer) => (
                <div key={offer.id} className={styles.offerCard}>
                  <div>
                    <strong>{offer.name}</strong>
                    <span>{offer.discount}% off</span>
                  </div>
                  <label className={styles.toggle}>
                    <input type="checkbox" checked={offer.active} onChange={() => setOffers((prev) => prev.map((o) => o.id === offer.id ? { ...o, active: !o.active } : o))} />
                    <span className={styles.toggleSlider} />
                  </label>
                </div>
              ))}
            </div>
          </>
        )}

        {activePanel === 'festival' && (
          <>
            <h1>🎄 Festival Control</h1>
            <p className={styles.festivalHint}>Site-wide particle effects — active on every page for all visitors.</p>
            <div className={styles.festivalOptions}>
              {FESTIVAL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`${styles.festivalBtn} ${festivalMode === opt.value ? styles.festivalActive : ''}`}
                  onClick={() => handleFestivalChange(opt)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </>
        )}
      </main>

      {detailOrder && (
        <div className={styles.modalOverlay} onClick={() => setDetailOrder(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>Order Details — {detailOrder.id}</h2>
            <div className={styles.modalGrid}>
              <div><span>Customer</span><strong>{detailOrder.customer}</strong></div>
              <div><span>Product</span><strong>{detailOrder.product} ({detailOrder.sizeLabel || detailOrder.size})</strong></div>
              <div><span>Status</span><strong>{detailOrder.status}</strong></div>
              <div><span>Total</span><strong>{formatPrice(detailOrder.total)}</strong></div>
            </div>
            <GiftMessageBox message={detailOrder.giftMessage} />
            {detailOrder.wrapping && <p><strong>Wrapping:</strong> {detailOrder.wrapping}</p>}
            {detailOrder.addons?.length > 0 && (
              <p><strong>Add-ons:</strong> {detailOrder.addons.map((a) => a.name).join(', ')}</p>
            )}
            <button type="button" className="btn-outline" onClick={() => setDetailOrder(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
